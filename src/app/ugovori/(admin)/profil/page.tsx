"use client";
import { UserProfile } from "@clerk/nextjs";
export default function ProfilePage() {
  return <div className="ep-clerk-profile"><UserProfile routing="hash" /></div>;
}
