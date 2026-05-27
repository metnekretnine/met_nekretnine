"use client";

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '@/lib/constants';

export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = Cookies.get(COOKIE_CONSENT_NAME);
    if (consent !== 'false') {
      setHasConsent(true);
    }
  }, []);

  return hasConsent;
};
