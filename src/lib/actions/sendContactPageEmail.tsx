"use server";

import { render } from "@react-email/render";
import { EmailTemplateContact } from "@/email-templates";
import { sendEmail } from "./helpers";
import { COMPANY_NAME, CONTACT_FORM_EMAIL_TITLE } from "@/lib/constants";

interface ContactData {
  name: string; // The name of the sender from the contact form.
  email: string; // The email of the sender from the contact form.
  phone?: string; // Optional phone number from the contact form.
  message: string; // The message content from the contact form.
}

export async function sendContactPageEmail(contactData: ContactData) {
  try {
    if (!contactData.name || !contactData.email || !contactData.message) {
      return { error: "Missing required fields" };
    }

    const emailHtml = await render(
      <EmailTemplateContact
        name={contactData.name}
        email={contactData.email}
        phone={contactData.phone}
        message={contactData.message}
      />,
    );

    const from = `${COMPANY_NAME} <${process.env.NEXT_PUBLIC_CONTACT_FORM_SENDER_EMAIL!}>`;
    const to = process.env.NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL!;

    const result = await sendEmail({
      from,
      to,
      subject: CONTACT_FORM_EMAIL_TITLE,
      html: emailHtml,
    });

    return result;
  } catch (error) {
    console.error("Error sending contact page email:", error);
    return { error: "Failed to send contact page email" };
  }
}
