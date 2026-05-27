export const MAX_FEATURED_LISTINGS = 4;

export const FEATURED_LISTINGS_COUNT_QUERY = `count(*[
  _type == "listing" &&
  isFeatured == true &&
  type == "rent" &&
  category == "apartment" &&
  !(_id in path("drafts.**")) &&
  !(_id in [$draftId, $publishedId])
])`;
