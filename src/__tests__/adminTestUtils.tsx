import { render, type RenderOptions } from "@testing-library/react";
import { AdminAuthProvider } from "@/lib/useAdminAuth";

/** Wrapper til admin-side-tests — useAdminAuth kræver provider siden layout.tsx */
export function renderAdmin(ui: React.ReactElement, options?: RenderOptions) {
  return render(<AdminAuthProvider>{ui}</AdminAuthProvider>, options);
}
