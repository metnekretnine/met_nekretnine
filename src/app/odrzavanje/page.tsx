import { PortableText } from "@portabletext/react";
import { Wrench } from "lucide-react";
import { fetchMaintenancePageCms } from "@/sanity/queries";
import { getLang, generatePageMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { UNDER_MAINTENANCE_LINK } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const maintenanceCms = await fetchMaintenancePageCms(lang);

  return generatePageMetadata({
    metaTitle: maintenanceCms.metaTitle,
    metaDescription: maintenanceCms.metaDescription,
    metaOgImage: maintenanceCms.metaOgImage,
    canonicalPath: UNDER_MAINTENANCE_LINK,
    noIndex: true,
  });
}

export default async function MaintenancePage() {
  const lang = await getLang();
  const maintenanceCms = await fetchMaintenancePageCms(lang);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background">
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-10">
        <Wrench className="w-10 h-10 text-white" />
      </div>

      {maintenanceCms.maintenanceText &&
        maintenanceCms.maintenanceText.length > 0 && (
          <div className="text-lg md:text-xl text-muted-foreground text-center max-w-xl px-global leading-relaxed">
            <PortableText value={maintenanceCms.maintenanceText} />
          </div>
        )}
    </div>
  );
}
