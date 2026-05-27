import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/shadcn/lib/utils";
import { PortableText } from "@/components";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface ContentSectionProps {
  section: {
    text: PortableTextBlock[];
    image?: {
      image: SanityImageSource;
      alt?: string;
    };
  };
  isDark: boolean;
  isColorInverse?: boolean;
  isImageInverse?: boolean;
}

export const ContentSection = ({
  section,
  isDark,
  isColorInverse = false,
  isImageInverse = false,
}: ContentSectionProps) => {
  const hasImage = !!section.image?.image;
  const shouldBeDark = isDark ? !isColorInverse : isColorInverse;

  if (!hasImage) {
    return (
      <section
        className={cn(
          "py-12 md:py-24",
          shouldBeDark ? "bg-foreground" : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-global">
          <div className="max-w-4xl mx-auto">
            <PortableText
              value={section.text}
              isBackgroundDark={shouldBeDark}
              textSize="text-lg md:text-2xl"
            />
          </div>
        </div>
      </section>
    );
  }

  let flexClass = isDark ? "md:flex-row-reverse" : "md:flex-row";
  if (isImageInverse) {
    flexClass = isDark ? "md:flex-row" : "md:flex-row-reverse";
  }

  return (
    <section className={cn("py-12 md:py-24", shouldBeDark && "bg-foreground")}>
      <div className="container mx-auto px-global">
        <div
          className={cn(
            "flex flex-col items-center gap-12 md:gap-20",
            flexClass,
          )}
        >
          <div className="w-full md:w-1/2">
            <PortableText
              value={section.text}
              isBackgroundDark={shouldBeDark}
              textSize="text-lg md:text-2xl"
            />
          </div>

          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] group">
              <Image
                src={urlFor(section.image!.image).width(800).height(600).url()}
                alt={section.image!.alt || ""}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
