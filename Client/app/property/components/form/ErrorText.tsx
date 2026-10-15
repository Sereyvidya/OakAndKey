import type { ReactNode } from "react";

export default function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="form-error-text mt-1 text-sm">{children}</p>;
}
