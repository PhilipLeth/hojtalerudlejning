"use client";

/**
 * Fejl hos kunderne — egen side.
 *
 * Panelet lå øverst på /admin/indstillinger, mellem åbningstider og
 * firmaoplysninger. To ting man aldrig laver samtidig: indstillinger rettes en
 * håndfuld gange om året, fejlene ser man efter, når noget er galt. Og
 * indstillingssiden var vokset til 650 linjer med panelet siddende over
 * indholdet, så man skulle scrolle forbi kundernes fejl for at rette et
 * telefonnummer.
 *
 * Ligger nu under System i menuen, ved siden af Notifikationer — de to hænger
 * sammen: en mislykket booking giver både en push og en linje her.
 */

import AdminNav from "@/components/AdminNav";
import AdminLogin from "@/components/AdminLogin";
import FejlPanel from "@/components/admin/FejlPanel";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function FejlPage() {
  const { secret, ready, isLoggedIn, unauthorized } = useAdminAuth();

  if (!ready) return null;
  if (!isLoggedIn) return <AdminLogin title="Fejl" />;

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "20px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
      <AdminNav title="Fejl" />
      <FejlPanel secret={secret} onUnauthorized={unauthorized} />
    </div>
  );
}
