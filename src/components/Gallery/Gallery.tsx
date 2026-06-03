"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { getYouTubeId, getVimeoId } from "@/lib/utils/video";

interface GalleryProps {
  images: SanityImageSource[];
  title: string;
  video?: string;
  watermarkEnabled?: boolean;
  watermarkPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  watermarkText?: string;
  statusOverlayText?: string;
}

type GalleryItem =
  | { type: "image"; source: SanityImageSource }
  | { type: "video"; url: string };

const FALLBACK_IMAGE_DIMENSIONS = {
  width: 1600,
  height: 1200,
};

function getSanityImageDimensions(source: SanityImageSource) {
  const assetRef =
    typeof source === "string"
      ? source
      : (source as { asset?: { _id?: string; _ref?: string } })?.asset?._ref ||
        (source as { asset?: { _id?: string; _ref?: string } })?.asset?._id;

  const match = assetRef?.match(/-(\d+)x(\d+)-[^-]+$/);

  if (!match) {
    return FALLBACK_IMAGE_DIMENSIONS;
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

export const Gallery = ({
  images,
  title,
  video,
  watermarkEnabled = true,
  watermarkPosition = "bottom-right",
  watermarkText,
  statusOverlayText,
}: GalleryProps) => {
  const items: GalleryItem[] = [];

  if (images?.length > 0) {
    items.push({ type: "image", source: images[0] });
  }
  if (video) {
    items.push({ type: "video", url: video });
  }
  if (images?.length > 1) {
    for (const img of images.slice(1)) {
      items.push({ type: "image", source: img });
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  const scrollToIndex = useCallback((index: number) => {
    if (!mainRef.current) return;
    isInternalScroll.current = true;
    mainRef.current.scrollTo({
      left: mainRef.current.offsetWidth * index,
      behavior: "smooth",
    });
    setCurrentIndex(index);
    setTimeout(() => {
      isInternalScroll.current = false;
    }, 500);
  }, []);

  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const thumb = container.children[currentIndex] as HTMLElement;
    if (!thumb) return;
    container.scrollTo({
      left:
        thumb.offsetLeft - container.offsetWidth / 2 + thumb.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [currentIndex]);

  const handleMainScroll = useCallback(() => {
    if (!mainRef.current || isInternalScroll.current) return;
    const { scrollLeft, offsetWidth } = mainRef.current;
    if (offsetWidth === 0) return;
    const idx = Math.round(scrollLeft / offsetWidth);
    if (idx !== currentIndex && idx >= 0 && idx < items.length) {
      setCurrentIndex(idx);
    }
  }, [currentIndex, items.length]);

  if (items.length === 0) return null;

  const showThumbArrows = items.length > 5;

  return (
    <div className="space-y-4">
      {/* Main Carousel */}
      <div className="relative">
        <div
          ref={mainRef}
          onScroll={handleMainScroll}
          className="relative aspect-[4/3] flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory bg-[#f5f7f8] rounded-lg"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative flex-none w-full h-full snap-start"
            >
              <GallerySlide
                item={item}
                title={title}
                watermarkEnabled={watermarkEnabled}
                watermarkPosition={watermarkPosition}
                watermarkText={watermarkText}
                statusOverlayText={statusOverlayText}
              />
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <NavButton
              direction="prev"
              onClick={() =>
                scrollToIndex(
                  currentIndex > 0 ? currentIndex - 1 : items.length - 1,
                )
              }
            />
            <NavButton
              direction="next"
              onClick={() =>
                scrollToIndex(
                  currentIndex < items.length - 1 ? currentIndex + 1 : 0,
                )
              }
            />
          </>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="relative">
          {showThumbArrows && (
            <ThumbArrow
              direction="left"
              onClick={() =>
                thumbsRef.current?.scrollBy({ left: -200, behavior: "smooth" })
              }
            />
          )}

          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => scrollToIndex(idx)}
                className={`
                  relative flex-none w-[calc(20%-6.4px)] aspect-[4/3] overflow-hidden
                  rounded-[8px] md:rounded-md bg-black snap-start transition-all
                  ${
                    currentIndex === idx
                      ? "border-brand-primary"
                      : "border-brand-primary/10 opacity-70 hover:opacity-100"
                  }
                `}
              >
                {item.type === "image" ? (
                  <Image
                    src={urlFor(item.source).url()}
                    alt={`${title} - ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-primary">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {showThumbArrows && (
            <ThumbArrow
              direction="right"
              onClick={() =>
                thumbsRef.current?.scrollBy({ left: 200, behavior: "smooth" })
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Sub-components ─── */

const GallerySlide = ({
  item,
  title,
  watermarkEnabled,
  watermarkPosition,
  watermarkText,
  statusOverlayText,
}: {
  item: GalleryItem;
  title: string;
  watermarkEnabled: boolean;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  watermarkText?: string;
  statusOverlayText?: string;
}) => {
  if (item.type === "image") {
    const { width, height } = getSanityImageDimensions(item.source);

    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f7f8]">
        <Image
          src={urlFor(item.source).url()}
          alt={title}
          width={width}
          height={height}
          className="h-full w-auto max-w-none object-contain"
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
        {watermarkEnabled && watermarkText && (
          <Watermark position={watermarkPosition} text={watermarkText} />
        )}
        {statusOverlayText && <StatusOverlay text={statusOverlayText} />}
      </div>
    );
  }

  const ytId = getYouTubeId(item.url);
  const vimeoId = getVimeoId(item.url);

  if (ytId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}`}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  if (vimeoId) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}`}
        className="w-full h-full"
        allowFullScreen
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white hover:text-brand-primary transition-colors underline"
      >
        Watch Video
      </a>
    </div>
  );
};

const StatusOverlay = ({ text }: { text: string }) => {
  return (
    <span className="absolute bottom-4 right-4 z-20 rounded bg-black/25 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm md:bottom-5 md:right-5 md:px-4 md:py-2 md:text-xs">
      {text}
    </span>
  );
};

const Watermark = ({
  position,
  text,
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  text: string;
}) => {
  const positionClass = {
    "top-left": "left-4 top-4",
    "top-right": "right-4 top-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }[position];

  return (
    <span
      className={`absolute ${positionClass} rounded bg-black/35 px-3 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/85 backdrop-blur-sm`}
    >
      {text}
    </span>
  );
};

const NavButton = ({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) => {
  const isLeft = direction === "prev";
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 ${isLeft ? "left-2 md:left-4" : "right-2 md:right-4"} bg-white/90 p-2 md:p-2.5 rounded-full shadow-lg border border-brand-primary/10 hover:bg-white hover:scale-110 transition-all`}
      aria-label={isLeft ? "Previous" : "Next"}
    >
      {isLeft ? (
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
      ) : (
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-brand-primary" />
      )}
    </button>
  );
};

const ThumbArrow = ({
  direction,
  onClick,
}: {
  direction: "left" | "right";
  onClick: () => void;
}) => {
  const isLeft = direction === "left";
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 ${isLeft ? "-left-1 md:-left-4" : "-right-1 md:-right-4"} bg-white/90 p-1 md:p-1.5 rounded-full shadow-md border border-brand-primary/10 hover:bg-white hover:scale-110 transition-all`}
      aria-label={`Scroll thumbnails ${direction}`}
    >
      {isLeft ? (
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
      ) : (
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
      )}
    </button>
  );
};
