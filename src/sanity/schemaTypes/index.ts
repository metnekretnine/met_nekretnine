import { type SchemaTypeDefinition } from "sanity";

import { localeString } from "./localeString";
import { localeRichText } from "./localeRichText";
import { contentSection } from "./contentSection";
import { faqSection } from "./faqSection";
import { metHomePage } from "./metHomePage";
import { apartmentsRentPage } from "./apartmentsRentPage";
import { landlordsPage } from "./landlordsPage";
import { tenantsPage } from "./tenantsPage";
import { submitApartmentPage } from "./submitApartmentPage";
import { agencyPage } from "./agencyPage";
import { termsPage } from "./termsPage";
import { cookiePolicyPage } from "./cookiePolicyPage";
import { contactPage } from "./contactPage";
import { contactFormSection } from "./contactFormSection";
import { navigationSection } from "./navigationSection";
import { footerSection } from "./footerSection";
import { notFoundPage } from "./notFoundPage";
import { cookieConsentSection } from "./cookieConsentSection";
import { privacyPolicyPage } from "./privacyPolicyPage";
import { author } from "./author";
import { category } from "./category";
import { post } from "./post";
import { blogPage } from "./blogPage";
import { blogCategoryPage } from "./blogCategoryPage";
import { blogAuthorPage } from "./blogAuthorPage";
import { topPicksSection } from "./topPicksSection";
import { blogPostsSection } from "./blogPostsSection";
import { categoriesFilterSection } from "./categoriesFilterSection";
import { whatsAppButtonSection } from "./whatsAppButtonSection";
import { configurationSection } from "./configurationSection";
import { maintenancePage } from "./maintenancePage";
import { ctaSection } from "./ctaSection";
import { notificationBarSection } from "./notificationBarSection";
import { howWeDoItSection } from "./howWeDoItSection";
import { recentPostsSection } from "./recentPostsSection";
import { agent } from "./agent";
import { listing } from "./listing";
import { listingDetailsPage } from "./listingDetailsPage";
import { listingExplorerSection } from "./listingExplorerSection";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    localeString,
    localeRichText,
    contentSection,
    faqSection,
    howWeDoItSection,
    configurationSection,
    metHomePage,
    apartmentsRentPage,
    landlordsPage,
    tenantsPage,
    submitApartmentPage,
    agencyPage,
    termsPage,
    cookiePolicyPage,
    contactPage,
    contactFormSection,
    navigationSection,
    footerSection,
    notFoundPage,
    cookieConsentSection,
    privacyPolicyPage,
    author,
    category,
    post,
    blogPage,
    blogCategoryPage,
    blogAuthorPage,
    topPicksSection,
    blogPostsSection,
    categoriesFilterSection,
    recentPostsSection,
    whatsAppButtonSection,
    maintenancePage,
    ctaSection,
    notificationBarSection,
    agent,
    listing,
    listingDetailsPage,
    listingExplorerSection,
  ],
};
