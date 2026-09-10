"use client";
import { EPotpisLoader } from "@/components/EPotpisLoader/EPotpisLoader";
import { useEPotpisAdmin } from "@/components/EPotpisAdmin/EPotpisAdmin";

export default function Loading() {
  const { cms } = useEPotpisAdmin();
  return <EPotpisLoader label={cms.loading} />;
}
