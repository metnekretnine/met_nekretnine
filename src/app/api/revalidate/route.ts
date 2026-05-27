import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody(
      req,
      process.env.SANITY_WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      const message = "Invalid signature";
      return new Response(message, { status: 401 });
    }

    if (!body?._type) {
      const message = "Bad Request";
      return new Response(message, { status: 400 });
    }

    type SanityWebhookBody = {
      _type: string;
      slug?: {
        current?: string;
      };
    };

    const typedBody = body as SanityWebhookBody;

    const revalidateTypes = new Set([
      "metHomePage",
      "apartmentsRentPage",
      "landlordsPage",
      "tenantsPage",
      "submitApartmentPage",
      "agencyPage",
      "termsPage",
      "cookiePolicyPage",
      "listingDetailsPage",
      "contactPage",
      "privacyPolicyPage",
      "blogPage",
      "blogAuthorPage",
      "blogCategoryPage",
      "configurationSection",
      "blogPostsSection",
      "recentPostsSection",
      "categoriesFilterSection",
      "contactFormSection",
      "cookieConsentSection",
      "ctaSection",
      "footerSection",
      "maintenancePage",
      "navigationSection",
      "notFoundPage",
      "notificationBarSection",
      "privacyPolicyPage",
      "topPicksSection",
      "whatsAppButtonSection",
      "listingExplorerSection",
      "agent",
      "author",
    ]);

    if (revalidateTypes.has(typedBody._type)) {
      revalidateTag(typedBody._type);
      if (typedBody._type === "agent") {
        revalidateTag("listing");
      }
      if (typedBody._type === "author") {
        revalidateTag("post");
      }
    } else {
      switch (typedBody._type) {
        case "post":
          if (typedBody.slug?.current) {
            revalidateTag(`post-${typedBody.slug.current}`);
          }
          revalidateTag("post");
          revalidateTag("category");
          revalidateTag("author");
          break;
        case "listing":
          if (typedBody.slug?.current) {
            revalidateTag(`listing-${typedBody.slug.current}`);
          }
          revalidateTag("listing");
          revalidateTag("njuskalo-feed");
          break;
        case "category":
          revalidateTag("category");
          revalidateTag("post");
          break;
        default:
          // Fallback for any other document types not explicitly handled
          revalidateTag(typedBody._type);
          break;
      }
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return new Response(err.message, { status: 500 });
  }
}
