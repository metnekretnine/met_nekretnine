export interface Language {
  id: "hr" | "en";
  title: string;
  isDefault: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: "hr", title: "Hrvatski", isDefault: true },
  { id: "en", title: "English", isDefault: false },
];

export const DEFAULT_LANGUAGE: Language =
  SUPPORTED_LANGUAGES.find((lang) => lang.isDefault) || SUPPORTED_LANGUAGES[0];

export const X_NEXT_LOCALE_HEADER = "X-Next-Locale";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
export const COOKIE_CONSENT_NAME = "cookie_consent";

export const COMPANY_NAME = "MET d.o.o.";
export const COMPANY_PHONE_DISPLAY = "+385 91 444 7071";
export const COMPANY_PHONE_HREF = "tel:+385914447071";
export const COMPANY_WHATSAPP_NUMBER = "385914447071";
export const COMPANY_WHATSAPP_HREF = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}`;
export const DEFAULT_OG_IMAGE = "/default-og-image.webp";

export const DEFAULT_POSTS_LIMIT = 12;
export const LOAD_MORE_POSTS_INCREMENT = 12;
export const MIN_TOP_PICKS_REQUIRED = 3; //Won't display more than 3 top picks, and won't display top picks if there isn't at least 3 posts
export const HOME_LINK = "/";
export const RENT_LINK = "/stanovi-za-najam";
export const LISTING_LINK = "/stanovi-za-najam";
export const LANDLORD_LINK = "/za-najmodavce";
export const TENANT_LINK = "/za-najmoprimce";
export const SUBMIT_APARTMENT_LINK = "/ponudite-stan";
export const BLOG_LINK = "/blog";
export const ABOUT_LINK = "/o-agenciji";
export const CONTACT_LINK = "/kontakt";
export const TERMS_LINK = "/opci-uvjeti";
export const PRIVACY_POLICY_LINK = "/politika-privatnosti";
export const COOKIE_POLICY_LINK = "/politika-kolacica";
export const UNDER_MAINTENANCE_LINK = "/odrzavanje";
export const NOT_FOUND_LINK = "/404";

export const BLOG_AUTHOR_LINK = `${BLOG_LINK}/autor`;
export const BLOG_CATEGORY_LINK = `${BLOG_LINK}/kategorija`;

export const CONTACT_FORM_EMAIL_TITLE = "Novi upit s kontakt forme";
export const SUBMIT_APARTMENT_EMAIL_TITLE = "Novi upit za ponudu stana";

export const LISTINGS_PER_PAGE = 10;
export const NJUSKALO_USER_ID = "3165769";
