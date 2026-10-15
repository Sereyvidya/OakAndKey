import type { ReactNode } from "react";

export default function ContactLine({
  icon,
  children,
  iconColor,
  className = "flex min-w-0 items-center gap-2",
  textClassName = "max-w-[300px] truncate",
}: {
  icon: ReactNode;
  children: ReactNode;
  iconColor: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={className}>
      <div style={{ color: iconColor }}>{icon}</div>
      <span className={textClassName}>{children}</span>
    </div>
  );
}
