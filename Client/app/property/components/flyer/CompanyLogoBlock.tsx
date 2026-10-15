import type { FlyerTheme } from "@/app/lib/types";
import DefaultCompanyLogo from "./DefaultCompanyLogo";

export default function CompanyLogoBlock({
  isDefaultLogo,
  companyLogo,
  agentCompanyName,
  colors,
  logoClassName = "h-full w-full",
  fallbackClassName = "text-center text-xs font-semibold uppercase",
}: {
  isDefaultLogo: boolean;
  companyLogo: string;
  agentCompanyName: string;
  colors: FlyerTheme;
  logoClassName?: string;
  fallbackClassName?: string;
}) {
  if (isDefaultLogo) {
    return (
      <DefaultCompanyLogo
        primary={colors.primary}
        secondary={colors.secondary}
        className={logoClassName}
      />
    );
  }

  if (companyLogo) {
    return (
      <img
        src={companyLogo}
        alt="Company logo"
        className="max-h-full max-w-full object-contain"
      />
    );
  }

  return (
    <div className={fallbackClassName} style={{ color: `${colors.black}99` }}>
      {agentCompanyName || "Company Logo"}
    </div>
  );
}
