"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { sendContactPageEmail } from "@/lib/actions";
import { ContactFormSectionCMS } from "@/sanity/queries";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/components/ui/form";
import { Input } from "@/shadcn/components/ui/input";
import { Textarea } from "@/shadcn/components/ui/textarea";

interface ContactFormProps {
  cmsData: ContactFormSectionCMS;
  className?: string;
}

export const ContactForm = ({ cmsData, className }: ContactFormProps) => {
  const contactFormSchema = z.object({
    name: z.string().min(1, cmsData.nameRequiredError),
    email: z
      .string()
      .min(1, cmsData.emailRequiredError)
      .email(cmsData.emailInvalidError),
    phone: z.string().optional(),
    message: z.string().min(1, cmsData.messageRequiredError),
  });

  type FormData = z.infer<typeof contactFormSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await sendContactPageEmail(data);

      if ("success" in result && result.success) {
        toast.success(cmsData.successMessage);
        form.reset();
      } else {
        toast.error(cmsData.errorMessage);
        if ("error" in result && result.error) {
          console.error("Server action error:", result.error);
        }
      }
    } catch (error) {
      console.error("Failed to send contact page email:", error);
      toast.error(cmsData.errorMessage);
    }
  };

  const inputClassName =
    "h-14 rounded-full border border-[#dedede] !bg-white px-6 text-foreground shadow-none transition-colors placeholder:text-foreground/30 focus-visible:border-foreground/30 focus-visible:ring-0";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-4 ${className}`}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 pl-2">
                {cmsData.nameLabel}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={cmsData.namePlaceholder}
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs pl-6" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 pl-2">
                {cmsData.emailLabel}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={cmsData.emailPlaceholder}
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs pl-6" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 pl-2">
                {cmsData.phoneLabel}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={cmsData.phonePlaceholder}
                  className={inputClassName}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs pl-6" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 pl-2">
                {cmsData.messageLabel}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={cmsData.messagePlaceholder}
                  className="min-h-[150px] rounded-[1.5rem] border-[#dedede] !bg-white px-6 py-4 text-foreground shadow-none transition-colors placeholder:text-foreground/30 focus-visible:border-foreground/30 focus-visible:ring-0"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs pl-6" />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-14 rounded-full bg-foreground text-white text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
        >
          {form.formState.isSubmitting
            ? cmsData.sendingButtonText
            : cmsData.sendButtonText}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </Form>
  );
};
