"use client";

import { useState } from "react";
import { ChevronRight, PawPrint, Search } from "lucide-react";
import { ListingExplorerSectionCMS } from "@/sanity/queries/listingExplorerSection";

interface FilterValues {
  district: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
  rooms: string;
  petFriendly: boolean;
}

interface FilterFormProps {
  filters: FilterValues & { sort: string; page: number };
  allCounties: string[];
  onSearch?: (updated: Partial<FilterValues>) => void;
  cmsData: ListingExplorerSectionCMS;
}

const labelStyles =
  "text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-2 block";
const inputStyles =
  "w-full h-12 bg-foreground/[0.03] border border-foreground/5 rounded-lg px-4 text-foreground font-semibold placeholder:text-foreground/20 focus:outline-none focus:border-foreground/20 transition-all text-sm";
const selectStyles =
  "w-full h-12 bg-foreground/[0.03] border border-foreground/5 rounded-lg px-4 text-foreground font-semibold focus:outline-none focus:border-foreground/20 transition-all text-sm appearance-none cursor-pointer";

export default function FilterForm({
  filters,
  allCounties,
  onSearch,
  cmsData,
}: FilterFormProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Local draft state so changes don't trigger navigation until "Apply"
  const [draft, setDraft] = useState({
    district: filters.district,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minArea: filters.minArea,
    maxArea: filters.maxArea,
    rooms: filters.rooms,
    petFriendly: filters.petFriendly,
  });

  const updateDraft = (field: string, value: string | boolean) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSearch?.(draft);
    setIsMobileOpen(false);
  };

  return (
    <div className="w-full shrink-0 lg:w-[320px]">
      <button
        type="button"
        onClick={() => setIsMobileOpen((open) => !open)}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-foreground/10 bg-white px-4 text-sm font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm transition-colors hover:bg-foreground/[0.02] lg:hidden"
        aria-expanded={isMobileOpen}
        aria-controls="listing-mobile-filters"
      >
        <span>{cmsData.title}</span>
        <ChevronRight
          className={`h-4 w-4 text-foreground/40 transition-transform ${
            isMobileOpen ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>

      <div
        id="listing-mobile-filters"
        className={`mt-3 lg:mt-0 ${isMobileOpen ? "block" : "hidden lg:block"}`}
      >
        <div className="rounded-lg border border-foreground/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground leading-none">
              {cmsData.title}
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className={labelStyles}>{cmsData.locationLabel}</label>
              <div className="relative">
                <select
                  value={draft.district}
                  onChange={(e) => updateDraft("district", e.target.value)}
                  className={selectStyles}
                >
                  <option value="all">{cmsData.allCountiesLabel}</option>
                  {allCounties.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 rotate-90 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelStyles}>{cmsData.roomsLabel}</label>
              <div className="relative">
                <select
                  value={draft.rooms}
                  onChange={(e) => updateDraft("rooms", e.target.value)}
                  className={selectStyles}
                >
                  <option value="all">{cmsData.allRoomsLabel}</option>
                  <option value="studio_apartment">
                    {cmsData.studioApartmentLabel}
                  </option>
                  <option value="one_room">{cmsData.oneRoomLabel}</option>
                  <option value="two_rooms">{cmsData.twoRoomsLabel}</option>
                  <option value="three_rooms">{cmsData.threeRoomsLabel}</option>
                  <option value="four_rooms">{cmsData.fourRoomsLabel}</option>
                  <option value="five_rooms">{cmsData.fiveRoomsLabel}</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 rotate-90 pointer-events-none" />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className={labelStyles}>{cmsData.priceLabel}</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder={cmsData.minPlaceholder}
                  value={draft.minPrice}
                  onChange={(e) => updateDraft("minPrice", e.target.value)}
                  className={inputStyles}
                />
                <input
                  type="number"
                  placeholder={cmsData.maxPlaceholder}
                  value={draft.maxPrice}
                  onChange={(e) => updateDraft("maxPrice", e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className={labelStyles}>{cmsData.areaLabel}</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder={cmsData.minPlaceholder}
                  value={draft.minArea}
                  onChange={(e) => updateDraft("minArea", e.target.value)}
                  className={inputStyles}
                />
                <input
                  type="number"
                  placeholder={cmsData.maxPlaceholder}
                  value={draft.maxArea}
                  onChange={(e) => updateDraft("maxArea", e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>

            <label
              htmlFor="petFriendly"
              className="flex items-center gap-4 cursor-pointer group transition-all"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <input
                  type="checkbox"
                  id="petFriendly"
                  checked={draft.petFriendly}
                  onChange={(e) =>
                    updateDraft("petFriendly", e.target.checked)
                  }
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-foreground/10 transition-all checked:bg-primary checked:border-primary group-hover:border-primary/40"
                />
                <PawPrint className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground select-none">
                {cmsData.petFriendlyLabel}
              </span>
            </label>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!onSearch}
              className="w-full h-13 rounded-lg bg-foreground text-white text-sm font-semibold uppercase tracking-[0.14em] flex items-center justify-center gap-3 transition-colors duration-300 hover:bg-foreground/90 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {cmsData.applyButtonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
