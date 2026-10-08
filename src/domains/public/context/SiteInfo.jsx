/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import getSocialMedias from "../api/socialMedia.api";
import getLocation from "../api/location.api";

/* ------------------------------------------------------------------
   Agency contact details, office location and social links, loaded
   once for the whole public site (header, contact, CTA and footer).
   ------------------------------------------------------------------ */

const DEFAULT_LOCATION = {
  latitude: 7.0559381,
  longitude: 38.4902358,
  address: "Addis Ababa, Ethiopia",
  name: "Office",
};

const SiteInfoContext = createContext(null);

const buildSocialLinks = (d = {}) => {
  const links = [
    ["facebook", "Facebook", d.facebook_username, (v) => `https://facebook.com/${v}`],
    ["instagram", "Instagram", d.instagram_username, (v) => `https://instagram.com/${v}`],
    ["telegram", "Telegram", d.telegram_username, (v) => `https://t.me/${v}`],
    ["tiktok", "TikTok", d.tiktok_username, (v) => `https://tiktok.com/@${v}`],
    ["linkedin", "LinkedIn", d.linkedin_username, (v) => `https://linkedin.com/in/${v}`],
    ["youtube", "YouTube", d.youtube_channel, (v) => `https://youtube.com/@${v}`],
    ["twitter", "X (Twitter)", d.twitter_username, (v) => `https://twitter.com/${v}`],
    [
      "whatsapp",
      "WhatsApp",
      d.whatsapp_number,
      (v) => `https://wa.me/${String(v).replace(/\D/g, "")}`,
    ],
  ];

  return links
    .filter(([, , value]) => value)
    .map(([key, label, value, toUrl]) => ({ key, label, url: toUrl(value) }));
};

export function SiteInfoProvider({ children }) {
  const [info, setInfo] = useState({
    phone: "",
    email: "",
    whatsapp: "",
    socials: [],
    location: DEFAULT_LOCATION,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [mediaRes, locationRes] = await Promise.allSettled([
        getSocialMedias(),
        getLocation(),
      ]);
      if (cancelled) return;

      const next = {};

      if (mediaRes.status === "fulfilled" && mediaRes.value?.data) {
        const d = mediaRes.value.data;
        next.phone = d.contact_number || "";
        next.email = d.email || "";
        next.whatsapp = d.whatsapp_number || "";
        next.socials = buildSocialLinks(d);
      } else if (mediaRes.status === "rejected") {
        console.error("Failed to load social media:", mediaRes.reason?.message);
      }

      if (locationRes.status === "fulfilled" && locationRes.value?.data) {
        const l = locationRes.value.data;
        next.location = {
          latitude: l.latitude ?? DEFAULT_LOCATION.latitude,
          longitude: l.longitude ?? DEFAULT_LOCATION.longitude,
          address: l.address ?? DEFAULT_LOCATION.address,
          name: l.name ?? DEFAULT_LOCATION.name,
        };
      } else if (locationRes.status === "rejected") {
        console.error("Failed to load location:", locationRes.reason?.message);
      }

      setInfo((prev) => ({ ...prev, ...next, loaded: true }));
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => info, [info]);

  return (
    <SiteInfoContext.Provider value={value}>{children}</SiteInfoContext.Provider>
  );
}

export function useSiteInfo() {
  const ctx = useContext(SiteInfoContext);
  if (!ctx) throw new Error("useSiteInfo must be used inside SiteInfoProvider");
  return ctx;
}
