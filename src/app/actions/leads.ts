"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getContent } from "@/lib/content";
import { render } from "@react-email/render";
import CampaignTemplate from "@/emails/campaign-template";
import { marked } from "marked";
import React from "react";

const leadSchema = z.object({
  email: z.string().email(),
  tool: z.string(),
  data: z.any(),
});

export async function captureLeadAction(input: z.infer<typeof leadSchema>) {
  const validated = leadSchema.safeParse(input);
  if (!validated.success) {
    return { error: "Invalid email address." };
  }

  const { email, tool, data } = validated.data;

  try {
    // 1. Upsert User
    await prisma.user.upsert({
      where: { email },
      update: { updatedAt: new Date() },
      create: {
        email,
        name: email.split('@')[0],
        newsletter: true,
      },
    });

    const content = await getContent();
    const siteName = content["global.siteName"] || "Comparlify";

    const reportHtml = `
      <h1>Your ${tool} Report</h1>
      <p>Thanks for using Comparlify! Based on your inputs, here is your high-fidelity analysis.</p>
      <hr />
      <h3>Financial Summary</h3>
      <ul>
        <li>Current Platform: <strong>${data.currentPlatform || 'N/A'}</strong></li>
        <li>Recommended Switch: <strong>${data.bestOption || 'N/A'}</strong></li>
        <li>Estimated Monthly Revenue: <strong>$${data.revenue?.toLocaleString() || '0'}</strong></li>
        <li>Potential Annual Savings: <strong style="color: #10b981;">$${data.annualSavings?.toLocaleString() || '0'}</strong></li>
      </ul>
      <p>By switching to ${data.bestOption}, you could optimize your profit margins and reduce platform drag.</p>
      <hr />
      <p><strong>Ready to switch?</strong> Check out our top recommendation here: <a href="${process.env.NEXTAUTH_URL}/api/out/${data.bestOptionId || ''}">Switch & Save</a></p>
    `;

    const emailHtml = await render(
      React.createElement(CampaignTemplate, {
        siteName,
        subject: `Your ${tool} Analysis`,
        content: await marked.parse(reportHtml),
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/unsubscribe`,
      })
    );

    await sendEmail({
      to: email,
      subject: `[Analysis] Your ${tool} Results`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("[LEAD_CAPTURE_ERROR]", error);
    return { error: "Failed to process request." };
  }
}
