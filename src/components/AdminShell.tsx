"use client";

import { AdminAuthProvider } from "@/lib/useAdminAuth";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
