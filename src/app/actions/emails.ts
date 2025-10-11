
"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import { marked } from "marked";
import CampaignTemplate from "@/emails/campaign-template";
import { getContent } from "@/lib/content";

const emailCampaignSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  content: z.string().min(20, "Email content must be at least 20 characters long."),
  excludedUserIds: z.array(z.string()).optional(),
});

// Create Email Campaign
export async function createEmailCampaign(prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }
  
  const validatedFields = emailCampaignSchema.safeParse({
    subject: formData.get('subject'),
    content: formData.get('content'),
    excludedUserIds: formData.getAll('excludedUserIds')
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { subject, content, excludedUserIds } = validatedFields.data;

  try {
    await prisma.emailCampaign.create({
      data: {
        subject,
        content,
        excludedUserIds: excludedUserIds,
      }
    });
    revalidatePath("/admin/emails");
  } catch (error) {
    console.error(error);
    return { error: "Failed to create email campaign." };
  }
  redirect("/admin/emails");
}

// Update Email Campaign
export async function updateEmailCampaign(id: string, prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const validatedFields = emailCampaignSchema.safeParse({
    subject: formData.get('subject'),
    content: formData.get('content'),
    excludedUserIds: formData.getAll('excludedUserIds')
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  
  const { subject, content, excludedUserIds } = validatedFields.data;
  
  try {
    const campaign = await prisma.emailCampaign.findUnique({ where: { id }});
    if (campaign?.status !== 'PENDING') {
      return { error: "Cannot update a campaign that is not in pending state." };
    }

    await prisma.emailCampaign.update({
      where: { id },
      data: {
        subject,
        content,
        excludedUserIds: excludedUserIds,
      },
    });
    revalidatePath("/admin/emails");
  } catch (error) {
    console.error(error);
    return { error: "Failed to update email campaign." };
  }

  redirect("/admin/emails");
}

// Delete Email Campaign
export async function deleteEmailCampaign(prevState: { error: string | null }, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  const id = formData.get('id') as string;
  if (!id) {
    return { error: "Campaign ID is missing." };
  }
  try {
    await prisma.emailCampaign.delete({ where: { id } });
    revalidatePath("/admin/emails");
    return { error: null }
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete email campaign." };
  }
}

// Send Test Email
const testEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  content: z.string(),
});
export async function sendTestEmailAction(input: z.infer<typeof testEmailSchema>) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized', success: false };
    }
    const validatedFields = testEmailSchema.safeParse(input);
    if (!validatedFields.success) {
        return { error: 'Invalid input', success: false };
    }
    try {
        const content = await getContent();
        const siteName = content['global.siteName'] || 'Comparlify';
        const htmlContent = await marked.parse(validatedFields.data.content);
        const emailHtml = render(
          CampaignTemplate({
              siteName,
              subject: `[Test] ${validatedFields.data.subject}`,
              content: htmlContent,
              unsubscribeUrl: `${process.env.NEXTAUTH_URL}/unsubscribe`
          })
        );
        
        await sendEmail({
            to: validatedFields.data.to,
            subject: `[Test] ${validatedFields.data.subject}`,
            html: emailHtml,
        });
        return { success: true, error: null };
    } catch(e) {
        console.error(e);
        return { error: 'Failed to send test email.', success: false };
    }
}

// Send Campaign
const sendCampaignSchema = z.object({
    campaignId: z.string(),
});
export async function sendCampaignAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
      return { error: 'Not authorized', success: false };
    }
    const validatedFields = sendCampaignSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: 'Invalid campaign ID.', success: false };
    }
    
    const { campaignId } = validatedFields.data;

    try {
        const campaign = await prisma.emailCampaign.findUnique({ 
          where: { id: campaignId },
        });
        if (!campaign) {
            return { error: "Campaign not found", success: false };
        }
        if (campaign.status !== 'PENDING') {
            return { error: "Campaign has already been sent or is sending.", success: false };
        }
        
        const excludedUserIds = campaign.excludedUserIds;

        const subscribers = await prisma.user.findMany({
            where: { 
              newsletter: true, 
              email: { not: null },
              id: { notIn: excludedUserIds }
            },
            select: { id: true, email: true }
        });

        await prisma.emailCampaign.update({
            where: { id: campaignId },
            data: { status: 'SENDING' }
        });

        if (subscribers.length === 0) {
            // No one to send to, just mark as sent.
            await prisma.emailCampaign.update({
                where: { id: campaignId },
                data: { status: 'SENT', sentAt: new Date() }
            });
            revalidatePath('/admin/emails');
            return { success: true, error: null, message: "Campaign sent (0 recipients)." };
        }

        await prisma.emailRecipient.createMany({
            data: subscribers.map(sub => ({
                campaignId: campaignId,
                userId: sub.id,
                status: 'PENDING'
            })),
            skipDuplicates: true
        });

        // Trigger background job without awaiting it
        processEmailCampaign(campaignId).catch(console.error);

        revalidatePath('/admin/emails');
        return { success: true, error: null, message: `Campaign is now sending to ${subscribers.length} recipients.` };

    } catch (e) {
        console.error(e);
        return { error: "Failed to start sending campaign.", success: false };
    }
}

async function processEmailCampaign(campaignId: string) {
  const content = await getContent();
  const siteName = content['global.siteName'] || 'Comparlify';
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      recipients: {
        where: { status: 'PENDING' },
        include: { user: { select: { id: true, email: true } } }
      }
    }
  });

  if (!campaign || campaign.status !== 'SENDING') return;

  const htmlContent = await marked.parse(campaign.content);
  
  for (const recipient of campaign.recipients) {
    if (recipient.user.email) {
      try {
        const unsubscribeToken = Buffer.from(recipient.user.id).toString('base64');
        const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?token=${unsubscribeToken}`;
        
        const emailHtml = render(
            CampaignTemplate({
                siteName,
                subject: campaign.subject,
                content: htmlContent,
                unsubscribeUrl
            })
        );
        
        await sendEmail({
          to: recipient.user.email,
          subject: campaign.subject,
          html: emailHtml,
        });

        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: { status: 'SUCCESS', sentAt: new Date() },
        });
      } catch (error) {
        await prisma.emailRecipient.update({
          where: { id: recipient.id },
          data: { status: 'FAILED', errorMessage: (error as Error).message },
        });
      }
    }
  }

  const remainingPending = await prisma.emailRecipient.count({ where: { campaignId, status: 'PENDING' }});
  
  if (remainingPending === 0) {
    await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: 'SENT', sentAt: new Date() },
    });
  }
  
  revalidatePath(`/admin/emails/view/${campaignId}`);
  revalidatePath('/admin/emails');
}


export async function retryFailedEmailsAction(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { error: 'Not authorized', success: false };
    }
    const content = await getContent();
    const siteName = content['global.siteName'] || 'Comparlify';
    const { campaignId } = sendCampaignSchema.parse(Object.fromEntries(formData.entries()));

    const campaign = await prisma.emailCampaign.findUnique({
        where: { id: campaignId },
        include: {
            recipients: {
                where: { status: 'FAILED' },
                include: { user: { select: { id: true, email: true }}}
            }
        }
    });

    if (!campaign) {
        return { error: 'Campaign not found.', success: false };
    }

    const htmlContent = await marked.parse(campaign.content);

    for (const recipient of campaign.recipients) {
        if (recipient.user.email) {
            try {
                const unsubscribeToken = Buffer.from(recipient.user.id).toString('base64');
                const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?token=${unsubscribeToken}`;
                
                 const emailHtml = render(
                    CampaignTemplate({
                        siteName,
                        subject: campaign.subject,
                        content: htmlContent,
                        unsubscribeUrl
                    })
                );

                await sendEmail({
                    to: recipient.user.email,
                    subject: campaign.subject,
                    html: emailHtml,
                });
                await prisma.emailRecipient.update({
                    where: { id: recipient.id },
                    data: { status: 'SUCCESS', sentAt: new Date(), errorMessage: null },
                });
            } catch (error) {
                // It failed again, keep the error message updated
                 await prisma.emailRecipient.update({
                    where: { id: recipient.id },
                    data: { errorMessage: (error as Error).message },
                });
            }
        }
    }
    revalidatePath(`/admin/emails/view/${campaignId}`);
    return { success: true, error: null };
}


export async function unsubscribeUserAction(token: string) {
    if (!token) {
        return { error: 'Invalid unsubscribe link.' };
    }
    try {
        const userId = Buffer.from(token, 'base64').toString('ascii');
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return { error: 'User not found.' };
        }
        await prisma.user.update({
            where: { id: userId },
            data: { newsletter: false }
        });
        return { success: true, email: user.email };
    } catch (e) {
        return { error: 'An error occurred during unsubscription.' };
    }
}

// Clone Email Campaign
export async function cloneCampaignAction(campaignId: string) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return { error: 'Not authorized' };
  }

  if (!campaignId) {
    return { error: 'Campaign ID is missing.' };
  }

  try {
    const originalCampaign = await prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!originalCampaign) {
      return { error: 'Original campaign not found.' };
    }

    const newCampaign = await prisma.emailCampaign.create({
      data: {
        subject: `[Clone] ${originalCampaign.subject}`,
        content: originalCampaign.content,
        excludedUserIds: originalCampaign.excludedUserIds,
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/emails');
    return { success: true, newCampaignId: newCampaign.id };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to clone campaign.' };
  }
}
