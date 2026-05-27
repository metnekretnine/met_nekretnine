import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { Language } from "../../lib/constants";

export interface TestimonialCMS {
  name: string;
  text: string;
  rating: number;
}

export interface TestimonialsSectionCMS {
  title: string;
  showMoreLabel: string;
  showLessLabel: string;
  testimonials: TestimonialCMS[];
}

export const testimonialsSectionQuery = groq`
  *[_type == "testimonialsSection"][0]{
    "title": title[$lang],
    "showMoreLabel": showMoreLabel[$lang],
    "showLessLabel": showLessLabel[$lang],
    testimonials[]{
      name,
      "text": text[$lang],
      rating
    }
  }
`;

export async function fetchTestimonialsSection(
  lang: Language["id"]
): Promise<TestimonialsSectionCMS> {
  const { data } = await sanityFetch({
    query: testimonialsSectionQuery,
    params: { lang },
    tags: ["testimonialsSection"],
  });

  if (!data) {
    notFound();
  }

  return data as TestimonialsSectionCMS;
}
