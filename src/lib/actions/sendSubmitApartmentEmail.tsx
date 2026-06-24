"use server";

import { randomUUID } from "crypto";
import { render } from "@react-email/render";
import { EmailTemplateSubmitApartment } from "@/email-templates";
import { getBaseUrl } from "@/config/env";
import env from "@/config/env";
import { writeClient } from "@/sanity/lib/writeClient";
import { sendEmail } from "./helpers";
import { COMPANY_NAME, SUBMIT_APARTMENT_EMAIL_TITLE } from "@/lib/constants";

interface SubmitApartmentData {
  name: string;
  phone: string;
  email: string;
  district: string;
  area: string;
  rooms: string;
  rentPrice: string;
  description: string;
}

interface SubmitApartmentInquiryDocument extends SubmitApartmentData {
  _id: string;
  receivedAt?: string;
  photoCount?: number;
}

function getStringField(formData: FormData, key: keyof SubmitApartmentData) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getFormDataString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getFormDataNumber(formData: FormData, key: string) {
  const value = Number(getFormDataString(formData, key));

  return Number.isFinite(value) ? value : undefined;
}

function formatBytesAsMegabytes(bytes?: number) {
  if (!bytes) {
    return undefined;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getSubmitApartmentData(formData: FormData): SubmitApartmentData {
  return {
    name: getStringField(formData, "name"),
    phone: getStringField(formData, "phone"),
    email: getStringField(formData, "email"),
    district: getStringField(formData, "district"),
    area: getStringField(formData, "area"),
    rooms: getStringField(formData, "rooms"),
    rentPrice: getStringField(formData, "rentPrice"),
    description: getStringField(formData, "description"),
  };
}

function hasRequiredFields(data: SubmitApartmentData) {
  return (
    data.name &&
    data.phone &&
    data.email &&
    data.district &&
    data.area &&
    data.rooms &&
    data.rentPrice &&
    data.description
  );
}

function sanitizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 500);
  }

  return "Unknown error";
}

function getInquiryAdminUrl(inquiryId: string) {
  return `${getBaseUrl()}/admin/structure/submitApartmentInquiry;${inquiryId}`;
}

export async function createSubmitApartmentInquiry(formData: FormData) {
  try {
    const submitData = getSubmitApartmentData(formData);

    if (!hasRequiredFields(submitData)) {
      return { error: "Missing required fields" };
    }

    const created = await writeClient.create({
      _type: "submitApartmentInquiry",
      status: "new",
      emailStatus: "pending",
      receivedAt: new Date().toISOString(),
      photos: [],
      ...submitData,
    });

    return { success: true, inquiryId: created._id };
  } catch (error) {
    console.error("Error creating submit apartment inquiry:", error);
    return { error: "Failed to save submit apartment inquiry" };
  }
}

export async function uploadSubmitApartmentInquiryPhoto(
  inquiryId: string,
  formData: FormData,
) {
  try {
    const photo = formData.get("photo");

    if (!(photo instanceof File) || photo.size === 0) {
      return { error: "Missing photo" };
    }

    const originalFilename =
      getFormDataString(formData, "originalFilename") || photo.name;
    const originalSizeBytes = getFormDataNumber(
      formData,
      "originalSizeBytes",
    );
    const compressedSizeBytes = getFormDataNumber(
      formData,
      "compressedSizeBytes",
    );
    const storedSizeBytes =
      getFormDataNumber(formData, "storedSizeBytes") ||
      compressedSizeBytes ||
      photo.size;
    const processingMode =
      getFormDataString(formData, "processingMode") || "Original";
    const contentType = photo.type || "image/jpeg";

    const asset = await writeClient.assets.upload(
      "image",
      Buffer.from(await photo.arrayBuffer()),
      {
        filename: photo.name || originalFilename,
        contentType,
      },
    );

    await writeClient
      .patch(inquiryId)
      .setIfMissing({ photos: [] })
      .append("photos", [
        {
          _key: randomUUID().replace(/-/g, ""),
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
          originalFilename,
          originalSizeBytes,
          originalSizeMb: formatBytesAsMegabytes(originalSizeBytes),
          storedSizeBytes,
          storedSizeMb: formatBytesAsMegabytes(storedSizeBytes),
          processingMode,
          compressedSizeBytes,
          compressedSizeMb: formatBytesAsMegabytes(compressedSizeBytes),
          contentType,
        },
      ])
      .commit();

    return { success: true, assetId: asset._id };
  } catch (error) {
    console.error("Error uploading submit apartment photo:", error);
    return { error: "Failed to upload submit apartment photo" };
  }
}

export async function sendSubmitApartmentEmail(inquiryId: string) {
  try {
    const inquiry = await writeClient.fetch<SubmitApartmentInquiryDocument | null>(
      `*[_type == "submitApartmentInquiry" && _id == $inquiryId][0]{
        _id,
        name,
        phone,
        email,
        district,
        area,
        rooms,
        rentPrice,
        description,
        receivedAt,
        "photoCount": count(photos)
      }`,
      { inquiryId },
    );

    if (!inquiry) {
      return { error: "Inquiry not found" };
    }

    const emailHtml = await render(
      <EmailTemplateSubmitApartment
        name={inquiry.name}
        phone={inquiry.phone}
        email={inquiry.email}
        district={inquiry.district}
        area={inquiry.area}
        rooms={inquiry.rooms}
        rentPrice={inquiry.rentPrice}
        description={inquiry.description}
        attachmentCount={inquiry.photoCount || 0}
        inquiryUrl={getInquiryAdminUrl(inquiry._id)}
      />,
    );

    const result = await sendEmail({
      from: `${COMPANY_NAME} <${env.NEXT_PUBLIC_CONTACT_FORM_SENDER_EMAIL}>`,
      to: env.NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL,
      subject: SUBMIT_APARTMENT_EMAIL_TITLE,
      html: emailHtml,
      replyTo: inquiry.email,
    });

    if ("success" in result && result.success) {
      await writeClient
        .patch(inquiry._id)
        .set({
          emailStatus: "sent",
          emailSentAt: new Date().toISOString(),
        })
        .unset(["emailError"])
        .commit();

      return { success: true, emailSent: true };
    }

    await writeClient
      .patch(inquiry._id)
      .set({
        emailStatus: "failed",
        emailError: "Failed to send email notification",
      })
      .commit();

    return { success: true, emailSent: false };
  } catch (error) {
    console.error("Error sending submit apartment email:", error);

    try {
      await writeClient
        .patch(inquiryId)
        .set({
          emailStatus: "failed",
          emailError: sanitizeErrorMessage(error),
        })
        .commit();
    } catch (patchError) {
      console.error("Error updating submit apartment email status:", patchError);
    }

    return { success: true, emailSent: false };
  }
}
