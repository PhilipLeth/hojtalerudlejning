"use client";

import SeasonCampaign from "./SeasonCampaign";
import type { Locale } from "@/lib/i18n";

export const HALLOWEEN_IDS = ["halloween_lys", "halloween_lille", "halloween_stor"];

export default function HalloweenHome({ locale = "da" }: { locale?: Locale }) {
  return <SeasonCampaign seasonId="halloween" locale={locale} />;
}
