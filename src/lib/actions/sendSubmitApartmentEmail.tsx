"use server";

import { render } from "@react-email/render";
import { EmailTemplateSubmitApartment } from "@/email-templates";
import { sendEmail } from "./helpers";
import { COMPANY_NAME, SUBMIT_APARTMENT_EMAIL_TITLE } from "@/lib/constants";

const MAX_ATTACHMENT_COUNT = 8;
const MAX_ATTACHMENT_SIZE = 6 * 1024 * 1024;

interface SubmitApartmentData {
  name: string;
  phone: string;
  email: string;
  district: string;
  area: string;
  rooms: string;
  rentPrice: string;
  description: string;
  photos?: File[];
}

function getStringField(formData: FormData, key: keyof SubmitApartmentData) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getPhotoFiles(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0)
    .slice(0, MAX_ATTACHMENT_COUNT);
}

async function getAttachments(files: File[]) {
  const safeFiles = files.filter((file) => file.size <= MAX_ATTACHMENT_SIZE);

  return Promise.all(
    safeFiles.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || undefined,
    })),
  );
}

export async function sendSubmitApartmentEmail(formData: FormData) {
  try {
    const submitData: SubmitApartmentData = {
      name: getStringField(formData, "name"),
      phone: getStringField(formData, "phone"),
      email: getStringField(formData, "email"),
      district: getStringField(formData, "district"),
      area: getStringField(formData, "area"),
      rooms: getStringField(formData, "rooms"),
      rentPrice: getStringField(formData, "rentPrice"),
      description: getStringField(formData, "description"),
      photos: getPhotoFiles(formData),
    };

    if (
      !submitData.name ||
      !submitData.phone ||
      !submitData.email ||
      !submitData.district ||
      !submitData.area ||
      !submitData.rooms ||
      !submitData.rentPrice ||
      !submitData.description
    ) {
      return { error: "Missing required fields" };
    }

    const attachments = await getAttachments(submitData.photos || []);
    const emailHtml = await render(
      <EmailTemplateSubmitApartment
        name={submitData.name}
        phone={submitData.phone}
        email={submitData.email}
        district={submitData.district}
        area={submitData.area}
        rooms={submitData.rooms}
        rentPrice={submitData.rentPrice}
        description={submitData.description}
        attachmentCount={attachments.length}
      />,
    );

    const from = `${COMPANY_NAME} <${process.env.NEXT_PUBLIC_CONTACT_FORM_SENDER_EMAIL!}>`;
    const to = process.env.NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL!;

    return await sendEmail({
      from,
      to,
      subject: SUBMIT_APARTMENT_EMAIL_TITLE,
      html: emailHtml,
      replyTo: submitData.email,
      attachments,
    });
  } catch (error) {
    console.error("Error sending submit apartment email:", error);
    return { error: "Failed to send submit apartment email" };
  }
}
