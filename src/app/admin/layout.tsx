import type { Metadata, Viewport } from "next";
import AdminPwa from "@/components/admin/AdminPwa";

export const metadata: Metadata = {
  title: "LH Admin",
  manifest: "/admin.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "LH Admin",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/images/admin-icon-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminPwa />
      {children}
    </>
  );
}
