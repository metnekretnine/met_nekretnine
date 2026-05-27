"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Navigation, NotificationBar } from "@/components";
import {
  NavigationSectionCMS,
  NotificationBarSectionCMS,
} from "@/sanity/queries";

const EXCLUDED_PATHS = ["/admin"];

interface HeaderWrapperProps {
  navigationCms: NavigationSectionCMS;
  notificationBarCms: NotificationBarSectionCMS;
}

export const HeaderWrapper: React.FC<HeaderWrapperProps> = ({
  navigationCms,
  notificationBarCms,
}) => {
  const pathname = usePathname();
  const [isNotificationBarVisible, setIsNotificationBarVisible] = useState(
    notificationBarCms.isEnabled && !!notificationBarCms.message
  );
  // Exclude header on specific paths
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50">
      {isNotificationBarVisible && (
        <NotificationBar
          message={notificationBarCms.message}
          setIsVisible={setIsNotificationBarVisible}
        />
      )}
      <Navigation cmsData={navigationCms} />
    </div>
  );
};
