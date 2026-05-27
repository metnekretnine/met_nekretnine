// app/api/njuskalo-feed/route.ts
import { NextResponse } from "next/server";
import { PortableTextBlock } from "sanity";
import { toPlainText } from "@portabletext/react";
import { fetchNjuskaloListings } from "@/sanity/queries";
import { NJUSKALO_USER_ID, RENT_LINK } from "@/lib/constants";
import {
  formatDateForNjuskalo,
  shouldSyncHeatingToNjuskalo,
} from "@/lib/listingFieldFormatters";

const NJUSKALO_AD_CLASS = "ad_flat_lease";
const NJUSKALO_CATEGORY_ID = "10920";
const MAX_NJUSKALO_IMAGES = 30;

const FLOOR_POSITION_MAP: Record<string, string> = {
  basement: "basement",
  ground_floor: "ground_floor",
  high_ground_floor: "high_ground",
  attic: "attic",
  high_attic: "high_attic",
  penthouse: "penthouse",
  "25_plus": "25",
};

// Sanity CDN webp -> jpg (Njuskalo supports only .jpg/.jpeg)
const toJpg = (url: string): string => {
  if (url.includes("cdn.sanity.io") && !url.includes(".jpg")) {
    return `${url}?fm=jpg`;
  }
  return url;
};

const escapeXml = (value: string | number): string =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const cdata = (value: string): string =>
  `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

const element = (name: string, value: string | number): string =>
  `    <${name}>${escapeXml(value)}</${name}>\n`;

const cdataElement = (name: string, value: string): string =>
  `    <${name}>${cdata(value)}</${name}>\n`;

const mapBuildingFloorPosition = (floor?: string): string | undefined => {
  if (!floor) {
    return undefined;
  }

  if (FLOOR_POSITION_MAP[floor]) {
    return FLOOR_POSITION_MAP[floor];
  }

  if (/^\d+$/.test(floor)) {
    return Number(floor) >= 25 ? "25" : floor;
  }

  return undefined;
};

const isYouTubeUrl = (url?: string): url is string =>
  Boolean(url && /(youtube\.com|youtu\.be)/i.test(url));

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL_PROD || "https://www.met-nekretnine.hr";

export async function GET() {
  try {
    const listings = await fetchNjuskaloListings();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += "<ad_list>\n";

    for (const listing of listings) {
      const url = `${baseUrl}${RENT_LINK}/${listing.slug}`;

      let descriptionText = listing.title;
      if (listing.description) {
        descriptionText = toPlainText(
          listing.description as PortableTextBlock[],
        ).substring(0, 4000);
      }

      const originalId = listing.code;
      const buildingFloorPosition = mapBuildingFloorPosition(listing.floor);
      const availableFromDate = formatDateForNjuskalo(
        listing.availableFromDate,
      );

      xml += `  <ad_item class="${NJUSKALO_AD_CLASS}">\n`;
      xml += element("user_id", NJUSKALO_USER_ID);
      xml += element("original_id", originalId);
      xml += cdataElement("title", listing.title);
      xml += element("external_url", url);
      xml += cdataElement("description_raw", descriptionText);
      xml += element("price", listing.price);
      xml += element("currency_id", 2);
      xml += element("category_id", NJUSKALO_CATEGORY_ID);

      // Phone from agent
      if (listing.agent?.phone) {
        const digits = listing.agent.phone.replace(/\D/g, "");
        const withoutCountry = digits.startsWith("385")
          ? digits.slice(3)
          : digits.startsWith("0")
            ? digits.slice(1)
            : digits;
        const areaCode = withoutCountry.slice(0, 2);
        const phoneNumber = withoutCountry.slice(2);

        xml += `    <phone_list>\n`;
        xml += `      <phone>\n`;
        xml += `        <calling_code>${escapeXml(385)}</calling_code>\n`;
        xml += `        <area_code>${escapeXml(areaCode)}</area_code>\n`;
        xml += `        <phone_number>${escapeXml(phoneNumber)}</phone_number>\n`;
        xml += `      </phone>\n`;
        xml += `    </phone_list>\n`;
      }

      if (isYouTubeUrl(listing.video)) {
        xml += element("youtube_url", listing.video);
      }

      xml += element("location_id", listing.njuskaloLocationId);
      xml += element("gmap_lng", listing.location.lng);
      xml += element("gmap_lat", listing.location.lat);
      xml += element("flatBuildingType", listing.flatBuildingType);
      xml += element("flatFloorCount", listing.flatFloorCount);
      xml += element("numberOfRooms", listing.numberOfRooms);
      if (buildingFloorPosition) {
        xml += element("buildingFloorPosition", buildingFloorPosition);
      }
      xml += element("livingArea", listing.livingArea);
      if (shouldSyncHeatingToNjuskalo(listing.heating)) {
        xml += element("heatingSource", listing.heating);
      }
      if (availableFromDate) {
        xml += element("availableFromDate", availableFromDate);
      }

      xml += element("yearlyAvailability", "all_year");

      if (listing.petFriendly) {
        xml += element("petsAllowed", 1);
      }

      xml += element("noAgencyCommission", 1);

      if (listing.images && listing.images.length > 0) {
        xml += `    <image_list>\n`;
        for (const img of listing.images.slice(0, MAX_NJUSKALO_IMAGES)) {
          if (img?.url) {
            xml += `      <image>${escapeXml(toJpg(img.url))}</image>\n`;
          }
        }
        xml += `    </image_list>\n`;
      }

      xml += `  </ad_item>\n`;
    }

    xml += "</ad_list>";

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating Njuskalo feed:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><e>Failed to generate feed</e>',
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      },
    );
  }
}
