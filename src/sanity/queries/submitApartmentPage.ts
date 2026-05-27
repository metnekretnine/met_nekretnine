import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Language } from "@/lib/constants";
import { sanityFetch } from "../lib/live";

export interface SubmitApartmentPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  heroBackgroundImageAlt: string;
  formSection: {
    nameLabel: string;
    namePlaceholder: string;
    nameRequiredError: string;
    phoneLabel: string;
    phonePlaceholder: string;
    phoneRequiredError: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailRequiredError: string;
    emailInvalidError: string;
    districtLabel: string;
    districtPlaceholder: string;
    districtRequiredError: string;
    areaLabel: string;
    areaPlaceholder: string;
    areaRequiredError: string;
    roomsLabel: string;
    roomsPlaceholder: string;
    roomsRequiredError: string;
    rentPriceLabel: string;
    rentPricePlaceholder: string;
    rentPriceRequiredError: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    descriptionRequiredError: string;
    photosLabel: string;
    photosHelpText: string;
    sendButtonText: string;
    sendingButtonText: string;
    successMessage: string;
    errorMessage: string;
  };
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

const submitApartmentPageQuery = groq`
  *[_type == "submitApartmentPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "heroBackgroundImageAlt": heroBackgroundImageAlt[$lang],
    "formSection": {
      "nameLabel": nameLabel[$lang],
      "namePlaceholder": namePlaceholder[$lang],
      "nameRequiredError": nameRequiredError[$lang],
      "phoneLabel": phoneLabel[$lang],
      "phonePlaceholder": phonePlaceholder[$lang],
      "phoneRequiredError": phoneRequiredError[$lang],
      "emailLabel": emailLabel[$lang],
      "emailPlaceholder": emailPlaceholder[$lang],
      "emailRequiredError": emailRequiredError[$lang],
      "emailInvalidError": emailInvalidError[$lang],
      "districtLabel": districtLabel[$lang],
      "districtPlaceholder": districtPlaceholder[$lang],
      "districtRequiredError": districtRequiredError[$lang],
      "areaLabel": areaLabel[$lang],
      "areaPlaceholder": areaPlaceholder[$lang],
      "areaRequiredError": areaRequiredError[$lang],
      "roomsLabel": roomsLabel[$lang],
      "roomsPlaceholder": roomsPlaceholder[$lang],
      "roomsRequiredError": roomsRequiredError[$lang],
      "rentPriceLabel": rentPriceLabel[$lang],
      "rentPricePlaceholder": rentPricePlaceholder[$lang],
      "rentPriceRequiredError": rentPriceRequiredError[$lang],
      "descriptionLabel": descriptionLabel[$lang],
      "descriptionPlaceholder": descriptionPlaceholder[$lang],
      "descriptionRequiredError": descriptionRequiredError[$lang],
      "photosLabel": photosLabel[$lang],
      "photosHelpText": photosHelpText[$lang],
      "sendButtonText": sendButtonText[$lang],
      "sendingButtonText": sendingButtonText[$lang],
      "successMessage": successMessage[$lang],
      "errorMessage": errorMessage[$lang]
    },
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage
  }
`;

export async function fetchSubmitApartmentPageCms(
  lang: Language["id"],
): Promise<SubmitApartmentPageCMS> {
  const { data } = await sanityFetch({
    query: submitApartmentPageQuery,
    params: { lang },
    tags: ["submitApartmentPage"],
  });
  if (!data) {
    notFound();
  }
  return data as SubmitApartmentPageCMS;
}
