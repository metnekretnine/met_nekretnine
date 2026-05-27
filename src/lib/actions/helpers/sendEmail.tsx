"use server";

import { Resend } from "resend";
import env from "@/config/env";
const resend = new Resend(env.RESEND_API_KEY);

interface EmailAttachment {
  filename?: string | false;
  content?: string | Buffer;
  contentType?: string;
}

interface SendEmailOptions {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement | null;
  replyTo?: string | string[];
  attachments?: EmailAttachment[];
}

export async function sendEmail({
  from,
  to,
  subject,
  html,
  react,
  replyTo,
  attachments,
}: SendEmailOptions) {
  try {
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
      react,
      replyTo,
      attachments,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error: "Failed to send email" };
  }
}
