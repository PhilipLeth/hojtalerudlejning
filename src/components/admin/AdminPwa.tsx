"use client";

import { useEffect } from "react";

/** Registrerer service worker så admin kan installeres som app på telefonen. */
export default function AdminPwa() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/admin" })
      .catch(() => {
        // Installation som app er en nice-to-have — admin virker uden.
      });
  }, []);
  return null;
}
