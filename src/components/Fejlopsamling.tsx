"use client";

/**
 * Installerer opsamling af ufangede JavaScript-fejl på hele sitet.
 *
 * Ligger som en tom komponent i layoutet, fordi den skal køre i browseren og
 * på hver eneste side — en fejl på produktsiden er lige så interessant som en
 * i booking-flowet, og det er dem, ingen kunde skriver til os om.
 */

import { useEffect } from "react";
import { installerFejlopsamling } from "@/lib/errorReport";

export default function Fejlopsamling() {
  useEffect(() => {
    installerFejlopsamling();
  }, []);
  return null;
}
