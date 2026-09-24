import { ChevronDown, Download } from "lucide-react";
import { Fragment, ReactNode } from "react";
import { ensurePriceListArchived } from "@/lib/price-list/archive";
import { getPublishedPriceListVersions } from "@/lib/price-list/store";
import { getLang } from "@/lib/utils";
import { fetchPriceListSectionCms } from "@/sanity/queries";
import { cn } from "@/shadcn/lib/utils";

// Replaces "{from}" and "{to}" in the CMS label with the given elements.
function fillValidityLabel(
  label: string,
  from: ReactNode,
  to: ReactNode,
): ReactNode {
  return label.split(/(\{from\}|\{to\})/).map((part, index) => (
    <Fragment key={index}>
      {part === "{from}" ? from : part === "{to}" ? to : part}
    </Fragment>
  ));
}

// Matches the table and link styles of PortableText.
const cellClassName =
  "border-b border-r border-border px-4 py-3 align-top last:border-r-0";
const linkClassName =
  "inline-flex items-center gap-2 text-primary underline decoration-primary/30 underline-offset-4 transition-colors duration-300 hover:decoration-primary";

// Self-contained server component: fetches its own data and is rendered by
// the "priceListTable" block inside rich text (see PortableText).
export async function PriceList() {
  await ensurePriceListArchived();
  const lang = await getLang();
  const [priceListCms, { current, archive }] = await Promise.all([
    fetchPriceListSectionCms(lang),
    getPublishedPriceListVersions(lang),
  ]);

  if (!priceListCms || !current) {
    return null;
  }

  const dateLocale = lang === "hr" ? "hr-HR" : "en-GB";
  const dateTimeFormat = new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Zagreb",
  });
  const dateFormat = new Intl.DateTimeFormat(dateLocale, {
    dateStyle: "long",
    timeZone: "Europe/Zagreb",
  });
  const renderTime = (value: string) => (
    <time dateTime={value}>{dateTimeFormat.format(new Date(value))}</time>
  );

  return (
    <div id="cjenik" className="not-prose my-8 scroll-mt-28">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm md:text-base">
          <thead>
            <tr>
              {[
                priceListCms.serviceLabel,
                priceListCms.payerLabel,
                priceListCms.currentPriceLabel,
                priceListCms.referencePriceLabel,
              ].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className={cn(
                    cellClassName,
                    "bg-muted/50 font-semibold text-foreground",
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-muted-foreground [&>tr:last-child>td]:border-b-0">
            {current.services.map((service) => (
              <tr key={service.key}>
                <td className={cellClassName}>
                  {service.name}
                  {service.note && (
                    <span className="mt-1 block text-sm">{service.note}</span>
                  )}
                </td>
                <td className={cellClassName}>{service.payer}</td>
                <td className={cellClassName}>
                  {service.currentPrice}
                  {service.maxPrice && (
                    <span className="mt-1 block text-sm">
                      {service.maxPrice}
                    </span>
                  )}
                  {service.isSpecialSale && service.specialSaleName && (
                    <span className="mt-2 inline-flex rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {service.specialSaleName}
                    </span>
                  )}
                </td>
                <td className={cellClassName}>
                  {service.referencePrice}
                  <time
                    className="mt-1 block text-sm"
                    dateTime={service.referenceDate}
                  >
                    {dateFormat.format(
                      new Date(`${service.referenceDate}T12:00:00`),
                    )}
                  </time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:text-base">
        <p>
          {priceListCms.lastUpdatedLabel} {renderTime(current.publishedAt)}
        </p>
        <a href="/cjenik/aktualni.csv" className={linkClassName}>
          <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
          {priceListCms.downloadCsvLabel}
        </a>
      </div>

      {archive.length > 0 && (
        <details className="group mt-6 border-y border-foreground/10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-semibold tracking-tight text-foreground/70 transition-colors duration-300 hover:text-foreground group-open:text-foreground md:text-lg [&::-webkit-details-marker]:hidden">
            {priceListCms.archiveTitle}
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-foreground/45 transition-transform duration-300 group-open:rotate-180"
            />
          </summary>
          <div className="pb-5 text-sm text-muted-foreground md:text-base">
            {priceListCms.archiveDescription && (
              <p className="mb-3">{priceListCms.archiveDescription}</p>
            )}
            <ul className="divide-y divide-border">
              {archive.map((version, index) => (
                <li
                  key={version.id}
                  className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between md:gap-6"
                >
                  <span>
                    {fillValidityLabel(
                      priceListCms.archiveItemLabel,
                      renderTime(version.publishedAt),
                      // Valid until the next (newer) version was published.
                      renderTime((archive[index - 1] ?? current).publishedAt),
                    )}
                  </span>
                  <a
                    href={`/cjenik/datoteke/${encodeURIComponent(version.fileName)}`}
                    className={cn(linkClassName, "shrink-0")}
                  >
                    <Download aria-hidden="true" className="h-4 w-4 shrink-0" />
                    {priceListCms.downloadArchiveLabel}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
