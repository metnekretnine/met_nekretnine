"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { sendSubmitApartmentEmail } from "@/lib/actions";
import { ZAGREB_DISTRICTS } from "@/lib/zagrebDistricts";
import { SubmitApartmentPageCMS } from "@/sanity/queries";
import { Input } from "@/shadcn/components/ui/input";
import { Textarea } from "@/shadcn/components/ui/textarea";

interface SubmitApartmentFormProps {
  cmsData: SubmitApartmentPageCMS["formSection"];
  className?: string;
}

interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

export const SubmitApartmentForm = ({
  cmsData,
  className,
}: SubmitApartmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedPhotosRef = useRef<SelectedPhoto[]>([]);

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(
    () => () => {
      selectedPhotosRef.current.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });
    },
    [],
  );

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, cmsData.nameRequiredError),
        phone: z.string().min(1, cmsData.phoneRequiredError),
        email: z
          .string()
          .min(1, cmsData.emailRequiredError)
          .email(cmsData.emailInvalidError),
        district: z.string().min(1, cmsData.districtRequiredError),
        area: z.string().min(1, cmsData.areaRequiredError),
        rooms: z.string().min(1, cmsData.roomsRequiredError),
        rentPrice: z.string().min(1, cmsData.rentPriceRequiredError),
        description: z.string().min(1, cmsData.descriptionRequiredError),
      }),
    [cmsData],
  );

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.delete("photos");
    selectedPhotos.forEach((photo) => {
      formData.append("photos", photo.file, photo.file.name);
    });

    const payload = Object.fromEntries(
      Array.from(formData.entries()).filter(([key]) => key !== "photos"),
    );
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0];

        if (typeof key === "string") {
          fieldErrors[key] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await sendSubmitApartmentEmail(formData);

      if ("success" in result && result.success) {
        toast.success(cmsData.successMessage);
        formRef.current?.reset();
        clearSelectedPhotos();
      } else {
        toast.error(cmsData.errorMessage);
      }
    } catch (error) {
      console.error("Failed to send submit apartment email:", error);
      toast.error(cmsData.errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSelectedPhotos = () => {
    selectedPhotosRef.current.forEach((photo) => {
      URL.revokeObjectURL(photo.previewUrl);
    });
    selectedPhotosRef.current = [];
    setSelectedPhotos([]);
  };

  const handlePhotosChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.currentTarget.files || []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) {
      return;
    }

    const timestamp = Date.now();
    const nextPhotos = files.map((file, index) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${timestamp}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedPhotos((current) => [...current, ...nextPhotos]);
    event.currentTarget.value = "";
  };

  const handleRemovePhoto = (id: string) => {
    setSelectedPhotos((current) => {
      const photo = current.find((item) => item.id === id);

      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  const inputClassName =
    "h-14 rounded-full border border-[#dedede] !bg-white px-6 text-foreground shadow-none transition-colors placeholder:text-foreground/30 focus-visible:border-foreground/30 focus-visible:ring-0";
  const labelClassName =
    "pl-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className={`grid gap-5 ${className || ""}`}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={cmsData.nameLabel}
          name="name"
          placeholder={cmsData.namePlaceholder}
          error={errors.name}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />
        <Field
          label={cmsData.phoneLabel}
          name="phone"
          placeholder={cmsData.phonePlaceholder}
          error={errors.phone}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />
      </div>

      <Field
        label={cmsData.emailLabel}
        name="email"
        type="email"
        placeholder={cmsData.emailPlaceholder}
        error={errors.email}
        labelClassName={labelClassName}
        inputClassName={inputClassName}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="district" className={labelClassName}>
            {cmsData.districtLabel}
          </label>
          <select
            id="district"
            name="district"
            className={`${inputClassName} w-full appearance-none`}
            defaultValue=""
          >
            <option value="">{cmsData.districtPlaceholder}</option>
            {ZAGREB_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="pl-6 text-xs text-red-400">{errors.district}</p>
          )}
        </div>
        <Field
          label={cmsData.areaLabel}
          name="area"
          placeholder={cmsData.areaPlaceholder}
          error={errors.area}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label={cmsData.roomsLabel}
          name="rooms"
          placeholder={cmsData.roomsPlaceholder}
          error={errors.rooms}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />
        <Field
          label={cmsData.rentPriceLabel}
          name="rentPrice"
          placeholder={cmsData.rentPricePlaceholder}
          error={errors.rentPrice}
          labelClassName={labelClassName}
          inputClassName={inputClassName}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={labelClassName}>
          {cmsData.descriptionLabel}
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder={cmsData.descriptionPlaceholder}
          className="min-h-[150px] rounded-[1.5rem] border-[#dedede] !bg-white px-6 py-4 text-foreground shadow-none transition-colors placeholder:text-foreground/30 focus-visible:border-foreground/30 focus-visible:ring-0"
        />
        {errors.description && (
          <p className="pl-6 text-xs text-red-400">{errors.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex min-h-28 w-full items-center justify-center rounded-lg border border-dashed border-foreground/15 bg-white px-6 py-6 text-left transition-colors hover:border-foreground/30"
      >
        <span className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-foreground/60">
            <Upload className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.14em]">
              {cmsData.photosLabel}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
              {cmsData.photosHelpText}
            </span>
          </span>
        </span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        name="photos"
        accept="image/*"
        multiple
        onChange={handlePhotosChange}
        className="sr-only"
      />

      {selectedPhotos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {selectedPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg border border-[#dedede] bg-white p-2"
            >
              <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-foreground/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element -- Blob previews should stay local and unoptimized. */}
                <img
                  src={photo.previewUrl}
                  alt={photo.file.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhoto(photo.id)}
                aria-label={`Ukloni ${photo.file.name}`}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/85 text-white shadow-sm transition-colors hover:bg-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 text-sm font-black uppercase tracking-[0.15em] text-white transition-colors hover:bg-foreground/90 disabled:opacity-50"
      >
        {isSubmitting ? cmsData.sendingButtonText : cmsData.sendButtonText}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
};

function Field({
  label,
  name,
  placeholder,
  error,
  type = "text",
  labelClassName,
  inputClassName,
}: {
  label: string;
  name: string;
  placeholder: string;
  error?: string;
  type?: string;
  labelClassName: string;
  inputClassName: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={inputClassName}
      />
      {error && <p className="pl-6 text-xs text-red-400">{error}</p>}
    </div>
  );
}
