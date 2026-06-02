"use client";

import { Suspense, useCallback } from "react";
import { ListingCMS } from "@/sanity/queries/listings";
import { ListingExplorerSectionCMS } from "@/sanity/queries/listingExplorerSection";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Language, LISTINGS_PER_PAGE } from "@/lib/constants";
import ListingGrid from "./ListingGrid";
import FilterForm from "./FilterForm";
import Pagination from "./Pagination";
import ListingHeader from "./ListingHeader";

export interface ListingFiltersProps {
  initialListings: ListingCMS[];
  totalResults: number;
  allCounties: string[];
  cmsData: ListingExplorerSectionCMS;
  lang: Language["id"];
}

// Derive filter state from URL — single source of truth, no useState/useEffect sync
function useFilters() {
  const searchParams = useSearchParams();

  return {
    district: searchParams.get("district") || "all",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minArea: searchParams.get("minArea") || "",
    maxArea: searchParams.get("maxArea") || "",
    rooms: searchParams.get("rooms") || "all",
    petFriendly: searchParams.get("petFriendly") === "true",
    sort: searchParams.get("sort") || "newest",
    page: Number(searchParams.get("page")) || 1,
  };
}

type FilterValues = ReturnType<typeof useFilters>;

function buildSearchParams(
  filters: Partial<FilterValues>,
): URLSearchParams {
  const params = new URLSearchParams();

  const defaults: Record<string, string | boolean | number> = {
    district: "all",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    rooms: "all",
    petFriendly: false,
    sort: "newest",
    page: 1,
  };

  for (const [key, value] of Object.entries(filters)) {
    const str = String(value);
    if (str && str !== String(defaults[key])) {
      params.set(key, str);
    }
  }

  return params;
}

function ListingExplorerContent({
  initialListings,
  totalResults,
  allCounties,
  cmsData,
  lang,
}: ListingFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const filters = useFilters();
  const totalPages = Math.ceil(totalResults / LISTINGS_PER_PAGE);

  const navigate = useCallback(
    (updates: Partial<FilterValues>, scroll = false) => {
      const next = { ...filters, ...updates };
      // Reset page when filters change (unless explicitly setting page)
      if (!("page" in updates)) next.page = 1;
      router.push(`${pathname}?${buildSearchParams(next).toString()}`, {
        scroll,
      });
    },
    [filters, pathname, router],
  );

  return (
    <div
      className="flex flex-col gap-10 pt-6 pb-12 md:gap-12 md:py-12 lg:flex-row lg:gap-16"
      id="listings"
    >
      <FilterForm
        filters={filters}
        allCounties={allCounties}
        onSearch={(updated) => navigate(updated)}
        cmsData={cmsData}
      />

      <div className="flex-1 space-y-12">
        <ListingHeader
          totalResults={totalResults}
          sort={filters.sort}
          onSortChange={(sort) => navigate({ sort })}
          cmsData={cmsData}
        />

        <ListingGrid
          listings={initialListings}
          cmsData={cmsData}
          lang={lang}
        />

        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => navigate({ page }, true)}
        />
      </div>
    </div>
  );
}

export default function ListingsExplorer(props: ListingFiltersProps) {
  return (
    <Suspense
      fallback={
        <ListingsExplorerSkeleton
          totalResults={props.totalResults}
          listings={props.initialListings}
          allCounties={props.allCounties}
          cmsData={props.cmsData}
          lang={props.lang}
        />
      }
    >
      <ListingExplorerContent
        initialListings={props.initialListings}
        totalResults={props.totalResults}
        allCounties={props.allCounties}
        cmsData={props.cmsData}
        lang={props.lang}
      />
    </Suspense>
  );
}

// Static fallback — no interactivity, no useSearchParams
function ListingsExplorerSkeleton({
  totalResults,
  listings,
  allCounties,
  cmsData,
  lang,
}: {
  totalResults: number;
  listings: ListingCMS[];
  allCounties: string[];
  cmsData: ListingExplorerSectionCMS;
  lang: Language["id"];
}) {
  return (
    <div className="flex flex-col gap-10 pt-6 pb-12 md:gap-12 md:py-12 lg:flex-row lg:gap-16">
      <FilterForm
        filters={{
          district: "all",
          minPrice: "",
          maxPrice: "",
          minArea: "",
          maxArea: "",
          rooms: "all",
          petFriendly: false,
          sort: "newest",
          page: 1,
        }}
        allCounties={allCounties}
        cmsData={cmsData}
      />

      <div className="flex-1 space-y-12">
        <ListingHeader totalResults={totalResults} cmsData={cmsData} />
        <ListingGrid listings={listings} cmsData={cmsData} lang={lang} />
      </div>
    </div>
  );
}
