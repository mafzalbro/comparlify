"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getContent } from "@/lib/content";
import { render } from "@react-email/render";
import CampaignTemplate from "@/emails/campaign-template";
import { marked } from "marked";
import React from "react";

// Helper to sanitize user input before injecting it into HTML emails
function escapeHtml(unsafe: any) {
  return String(unsafe || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

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

    // Sanitize all fields extracted from the user data object
    const safeTool = escapeHtml(tool);
    const safeCurrentPlatform = escapeHtml(data.currentPlatform || 'N/A');
    const safeBestOption = escapeHtml(data.bestOption || 'N/A');
    const safeRevenue = escapeHtml(data.revenue?.toLocaleString() || '0');
    const safeSavings = escapeHtml(data.annualSavings?.toLocaleString() || '0');
    
    // Ensure the ID is strictly alphanumeric/dashes to prevent URL manipulation
    const safeBestOptionId = String(data.bestOptionId || "").replace(/[^a-zA-Z0-9-]/g, '');

    const reportHtml = `
      <h1>Your ${safeTool} Report</h1>
      <p>Thanks for using Comparlify! Based on your inputs, here is your high-fidelity analysis.</p>
      <hr />
      <h3>Financial Summary</h3>
      <ul>
        <li>Current Platform: <strong>${safeCurrentPlatform}</strong></li>
        <li>Recommended Switch: <strong>${safeBestOption}</strong></li>
        <li>Estimated Monthly Revenue: <strong>$${safeRevenue}</strong></li>
        <li>Potential Annual Savings: <strong style="color: #10b981;">$${safeSavings}</strong></li>
      </ul>
      <p>By switching to ${safeBestOption}, you could optimize your profit margins and reduce platform drag.</p>
      <hr />
      <p><strong>Ready to switch?</strong> Check out our top recommendation here: <a href="${process.env.NEXTAUTH_URL}/api/out/${safeBestOptionId}">Switch & Save</a></p>
    `;

    const emailHtml = await render(
      React.createElement(CampaignTemplate, {
        siteName,
        subject: `Your ${safeTool} Analysis`,
        content: await marked.parse(reportHtml),
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/unsubscribe`,
      })
    );

    await sendEmail({
      to: email,
      subject: `[Analysis] Your ${safeTool} Results`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error("[LEAD_CAPTURE_ERROR]", error);
    return { error: "Failed to process request." };
  }
}