import { ChevronRight } from "lucide-react";
import { ListingExplorerSectionCMS } from "@/sanity/queries/listingExplorerSection";

interface ListingHeaderProps {
  totalResults: number;
  sort?: string;
  onSortChange?: (newSort: string) => void;
  cmsData: ListingExplorerSectionCMS;
}

export default function ListingHeader({
  totalResults,
  sort,
  onSortChange,
  cmsData,
}: ListingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-foreground/5">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {totalResults}
        </span>
        <span className="text-[10px] font-semibold text-foreground/35 uppercase tracking-[0.2em]">
          {cmsData.totalResultsLabel}
        </span>
      </div>

      <div className="relative w-fit">
        <select
          value={sort}
          onChange={(e) => onSortChange?.(e.target.value)}
          className="h-10 bg-transparent border-b border-foreground/10 text-foreground font-semibold focus:outline-none focus:border-foreground/30 transition-all text-[10px] uppercase tracking-[0.15em] appearance-none cursor-pointer pr-8 disabled:opacity-50 w-full"
          disabled={!onSortChange}
        >
          <option value="newest">{cmsData.sortNewestLabel}</option>
          <option value="price-asc">{cmsData.sortPriceAscLabel}</option>
          <option value="price-desc">{cmsData.sortPriceDescLabel}</option>
        </select>
        <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/30 rotate-90 pointer-events-none" />
      </div>
    </div>
  );
}
