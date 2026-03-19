"use client";

export default function InlineSpinner({ className = "h-4 w-4" }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} animate-spin rounded-full border-2 border-current border-r-transparent`}
    />
  );
}
