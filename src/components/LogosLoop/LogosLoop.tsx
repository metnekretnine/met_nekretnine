"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import { ClientsSectionCMS } from "@/sanity/queries/clientsSection";
import { urlFor } from "@/sanity/lib/image";

interface LogosLoopProps {
  cmsData: ClientsSectionCMS;
  className?: string;
}

export function LogosLoop({ cmsData, className }: LogosLoopProps) {
  if (!cmsData.logos || cmsData.logos.length === 0) {
    return null;
  }
  const clientLogosData = [...cmsData.logos, ...cmsData.logos];

  return (
    <div className={`w-full ${className}`}>
      <div className="container mx-auto px-global">
        {cmsData.title && (
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-brand-primary mb-8 text-center">
            {cmsData.title}
          </h2>
        )}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          slidesPerView={1.8}
          spaceBetween={40}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          allowTouchMove={false}
          breakpoints={{
            480: {
              slidesPerView: 2,
              spaceBetween: 40,
              speed: 4000,
            },
            600: {
              slidesPerView: 3,
              spaceBetween: 20,
              speed: 4000,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 10,
              speed: 4000,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 10,
              speed: 4000,
            },
            1280: {
              slidesPerView: 6,
              spaceBetween: 10,
              speed: 4000,
            },
          }}
          className="client-swiper"
        >
          {clientLogosData.map((logo, index) => (
            <SwiperSlide key={index}>
              {logo.image && (
                <Image
                  src={urlFor(logo.image).url()}
                  alt={logo.imageAlt || ""}
                  width={150}
                  height={50}
                  className="w-32 md:w-28 object-contain opacity-100 hover:opacity-70 transition-opacity duration-300 py-2"
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
