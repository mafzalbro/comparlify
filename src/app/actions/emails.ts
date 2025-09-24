"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { render } from "@react-email/render";
import { marked } from "marked";

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
        excludedUsers: {
          connect: excludedUserIds?.map(id => ({ id }))
        }
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
        excludedUsers: {
          set: excludedUserIds?.map(id => ({ id }))
        }
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
        const htmlContent = marked.parse(validatedFields.data.content);
        await sendEmail({
            to: validatedFields.data.to,
            subject: `[Test] ${validatedFields.data.subject}`,
            html: htmlContent,
        });
        return { success: true, error: null };
    } catch(e) {
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
          include: { excludedUsers: { select: { id: true }}}
        });
        if (!campaign) {
            return { error: "Campaign not found", success: false };
        }
        if (campaign.status !== 'PENDING') {
            return { error: "Campaign has already been sent or is sending.", success: false };
        }
        
        const excludedUserIds = campaign.excludedUsers.map(u => u.id);

        const subscribers = await prisma.user.findMany({
            where: { 
              newsletter: true, 
              email: { not: null },
              id: { notIn: excludedUserIds }
            },
            select: { id: true, email: true }
        });

        await prisma.$transaction(async (tx) => {
            await tx.emailCampaign.update({
                where: { id: campaignId },
                data: { status: 'SENDING' }
            });

            if (subscribers.length > 0) {
              await tx.emailRecipient.createMany({
                  data: subscribers.map(sub => ({
                      campaignId: campaignId,
                      userId: sub.id,
                      status: 'PENDING'
                  })),
                  skipDuplicates: true
              });
            }
        });

        // Trigger background job (simulated here with an async call)
        processEmailCampaign(campaignId);

        revalidatePath('/admin/emails');
        return { success: true, error: null };

    } catch (e) {
        console.error(e);
        return { error: "Failed to start sending campaign.", success: false };
    }
}

async function processEmailCampaign(campaignId: string) {
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

  for (const recipient of campaign.recipients) {
    if (recipient.user.email) {
      try {
        const unsubscribeToken = Buffer.from(recipient.user.id).toString('base64');
        const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?token=${unsubscribeToken}`;
        
        const emailBodyWithUnsubscribe = `${campaign.content}\n\n<hr>\n<p style="font-size: 12px; color: #666;">To unsubscribe from future emails, <a href="${unsubscribeUrl}">click here</a>.</p>`;

        const htmlContent = marked.parse(emailBodyWithUnsubscribe);
        
        await sendEmail({
          to: recipient.user.email,
          subject: campaign.subject,
          html: htmlContent,
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

    for (const recipient of campaign.recipients) {
        if (recipient.user.email) {
            try {
                const unsubscribeToken = Buffer.from(recipient.user.id).toString('base64');
                const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe?token=${unsubscribeToken}`;
                const emailBodyWithUnsubscribe = `${campaign.content}\n\n<hr>\n<p style="font-size: 12px; color: #666;">To unsubscribe from future emails, <a href="${unsubscribeUrl}">click here</a>.</p>`;
                const htmlContent = marked.parse(emailBodyWithUnsubscribe);

                await sendEmail({
                    to: recipient.user.email,
                    subject: campaign.subject,
                    html: htmlContent,
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
