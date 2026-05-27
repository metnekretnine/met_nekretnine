import { Language } from "@/lib/constants";

export const NJUSKALO_HEATING_OPTIONS = [
  {
    value: "not_selected",
    title: { hr: "Nije odabrano", en: "Not selected" },
  },
  {
    value: "no_heating",
    title: { hr: "Nema sustav grijanja", en: "No heating system" },
  },
  {
    value: "city_heating",
    title: { hr: "Gradska toplana", en: "City heating" },
  },
  {
    value: "gas_floor_heating",
    title: {
      hr: "Etažno plinsko centralno",
      en: "Individual gas central heating",
    },
  },
  {
    value: "electricity_floor_heating",
    title: {
      hr: "Etažno centralno na struju",
      en: "Individual electric central heating",
    },
  },
  {
    value: "common_boiler_room",
    title: { hr: "Zajednička kotlovnica", en: "Shared boiler room" },
  },
  {
    value: "fuel_oil_heating",
    title: { hr: "Peć na lož ulje", en: "Fuel oil heating" },
  },
  {
    value: "gas_heating",
    title: { hr: "Peć na plin", en: "Gas heater" },
  },
  {
    value: "wood_heating",
    title: { hr: "Peć na drva", en: "Wood heater" },
  },
  {
    value: "briquettes_pellets_heating",
    title: { hr: "Peć na brikete/pelete", en: "Briquette/pellet heater" },
  },
  {
    value: "solid_fuel_heating",
    title: { hr: "Peć na kruta goriva", en: "Solid fuel heater" },
  },
  {
    value: "electric_heaters_and_radiators",
    title: {
      hr: "Grijalice i radijatori na struju",
      en: "Electric heaters and radiators",
    },
  },
  {
    value: "heating_air_conditioning_and_ventilation_system",
    title: {
      hr: "Sustav grijanja, klimatizacije i ventilacije",
      en: "Heating, air conditioning and ventilation system",
    },
  },
  {
    value: "air_source_heat_pump",
    title: { hr: "Dizalica topline", en: "Air source heat pump" },
  },
] as const;

export type NjuskaloHeatingSource =
  (typeof NJUSKALO_HEATING_OPTIONS)[number]["value"];

export const shouldSyncHeatingToNjuskalo = (
  value: string | undefined,
): value is Exclude<NjuskaloHeatingSource, "not_selected"> =>
  Boolean(value && value !== "not_selected");

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const getHeatingLabel = (
  value: string | undefined,
  lang: Language["id"],
): string | undefined =>
  NJUSKALO_HEATING_OPTIONS.find((option) => option.value === value)?.title[
    lang
  ] || value;

export const formatDateForNjuskalo = (
  dateString: string | undefined,
): string | undefined => {
  const match = dateString?.match(DATE_ONLY_PATTERN);
  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  return `${day}.${month}.${year}.`;
};

const getZagrebTodayDateString = (): string => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

export const formatListingAvailability = (
  dateString: string | undefined,
  lang: Language["id"],
): string | undefined => {
  const formattedDate = formatDateForNjuskalo(dateString);
  if (!formattedDate || !dateString) {
    return undefined;
  }

  if (dateString <= getZagrebTodayDateString()) {
    return lang === "en" ? "Available now" : "Dostupno odmah";
  }

  return lang === "en"
    ? `Available from ${formattedDate}`
    : `Dostupno od ${formattedDate}`;
};
