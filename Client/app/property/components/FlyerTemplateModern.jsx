"use client";

import { Josefin_Sans } from "next/font/google";
import {
  cleanText,
  formatPrice,
  pickSrc,
  joinParts,
} from "@/app/lib/flyer/format";
import { FLYER_COLORS } from "@/app/lib/flyer/theme";
import { MailIcon } from "./FlyerIcons";
import { LuCalendarClock } from "react-icons/lu";
import { FaGlobe } from "react-icons/fa";
import DefaultCompanyLogo from "./DefaultCompanyLogo";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function FlyerTemplateModern({
  formData,
  images,
  theme = FLYER_COLORS,
  templateCopy = {},
}) {
  const COLORS = theme;
  const copy = templateCopy?.modern || {};

  const headlineSmall = cleanText(copy.headlineSmall?.text) || "Modern Home";
  const headlineSmallSize = copy.headlineSmall?.size || 64;

  const headlineLarge = cleanText(copy.headlineLarge?.text) || "For Sale";
  const headlineLargeSize = copy.headlineLarge?.size || 78;

  const tagline =
    cleanText(copy.tagline?.text) || "A Home That Fits Your Lifestyle";
  const taglineSize = copy.tagline?.size || 32;

  const taglineBody =
    cleanText(copy.taglineBody?.text) ||
    "Enjoy spacious interiors, modern touches, and a layout designed for convenience and comfort.";
  const taglineBodySize = copy.taglineBody?.size || 19;

  const aboutTitle = cleanText(copy.aboutTitle?.text) || "About The Property";
  const aboutTitleSize = copy.aboutTitle?.size || 30;

  const priceLabel = cleanText(copy.priceLabel?.text) || "Offered At";
  const priceLabelSize = copy.priceLabel?.size || 30;

  const appointmentLabel =
    cleanText(copy.appointmentLabel?.text) || "Call for appointment";
  const appointmentLabelSize = copy.appointmentLabel?.size || 12;

  const agentRole = cleanText(copy.agentRole?.text) || "Residential Specialist";
  const agentRoleSize = copy.agentRole?.size || 14;

  const address =
    joinParts([formData.addressCity, formData.addressState]) || "Austin, TX";
  const fullAddress = cleanText(formData.address) || address;

  const description =
    cleanText(formData.description) ||
    "Beautifully updated residence with open living spaces, refined finishes, and a layout designed for modern everyday living.";

  const priceText = cleanText(formData.price)
    ? `$${formatPrice(formData.price)}`
    : "Contact for price";

  const beds = formData.bedrooms !== "" ? Number(formData.bedrooms) : null;
  const baths = formData.bathrooms !== "" ? Number(formData.bathrooms) : null;
  const size = formData.size !== "" ? Number(formData.size) : null;

  const gallery = (images || []).map(pickSrc).filter(Boolean);
  const hero = gallery[0] || "";
  const galleryPhotos = gallery.slice(1, 7);

  const agentName = cleanText(formData.agentName) || "Listing Agent";
  const agentCompanyName = cleanText(formData.agentCompanyName);
  const phone = cleanText(formData.agentPhone);
  const email = cleanText(formData.agentEmail);
  const agentPhoto = pickSrc(formData.agentPhoto);
  const companyLogo = pickSrc(formData.agentCompanyLogo);
  const isDefaultLogo = formData.agentCompanyLogo?.type === "default-svg-logo";
  const socialLink = cleanText(formData.agentSocialLink);
  const qrSrc = socialLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        socialLink
      )}`
    : "";

  return (
    <div
      className={`${josefin.className} absolute inset-0 overflow-hidden`}
      style={{ background: COLORS.surface }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden"
        style={{ background: COLORS.surface }}
      >
        {/* Dark banner */}
        <div
          className="h-[120px] w-full"
          style={{ backgroundColor: COLORS.primary }}
        />

        {/* Top right label */}
        <div className="absolute top-[35px] right-[50px] z-20 text-right">
          <div
            className="text-4xl font-semibold tracking-wide uppercase"
            style={{ color: COLORS.secondary }}
          >
            {agentCompanyName}
          </div>
          <div
            className="mt-1 h-[3px] w-full"
            style={{ background: COLORS.secondary }}
          />
        </div>

        {/* Logo block */}
        <div
          className="absolute top-22 left-8 z-30 flex h-[150px] w-[150px] items-center justify-center rounded-lg p-2"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.secondary,
          }}
        >
          {isDefaultLogo ? (
            <DefaultCompanyLogo
              primary={COLORS.primary}
              secondary={COLORS.secondary}
              className="h-[115px] w-[115px]"
            />
          ) : companyLogo ? (
            <img
              src={companyLogo}
              alt="Company logo"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div
              className="text-center text-xs font-semibold uppercase"
              style={{ color: `${COLORS.black}99` }}
            >
              {agentCompanyName || "Company Logo"}
            </div>
          )}
        </div>

        {/* Hero image */}
        <div
          className="absolute top-[110px] right-0 h-[885px] w-[82%]"
          style={{ borderColor: COLORS.secondary }}
        >
          <img
            src={hero}
            alt="Main property"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className="absolute top-[60px] left-0 z-10 h-[330px] w-[360px]"
          style={{
            background: COLORS.secondary,
            clipPath: "polygon(0 0, 50% 0, 87% 100%, 0 100%)",
          }}
        />

        {/* White angled panel */}
        <div
          className="absolute top-[60px] left-0 z-15 h-[955px] w-[620px] border-t-5"
          style={{
            background: COLORS.surface,
            clipPath: "polygon(0 0, 28% 0, 90% 100%, 0 100%)",
            borderColor: COLORS.secondary,
          }}
        />

        {/* Title card */}
        <div
          className="absolute top-[250px] left-14 z-30 flex w-[620px] justify-center py-5 text-center"
          style={{ background: COLORS.secondary }}
        >
          <div className="w-fit">
            <div
              className="leading-[0.95] font-normal"
              style={{
                color: COLORS.primary,
                fontSize: `${headlineSmallSize}px`,
              }}
            >
              {headlineSmall}
            </div>
            <div
              className="leading-[0.95] font-bold tracking-tight uppercase"
              style={{
                color: COLORS.primary,
                fontSize: `${headlineLargeSize}px`,
              }}
            >
              {headlineLarge}
            </div>
          </div>
        </div>

        {/* Intro text */}
        <div className="absolute top-[480px] left-14 z-30 w-[285px]">
          <h2
            className="leading-[1.05] font-bold whitespace-pre-line"
            style={{
              color: COLORS.textMain,
              fontSize: `${taglineSize}px`,
            }}
          >
            {tagline}
          </h2>
          <p
            className="mt-3 font-semibold"
            style={{
              color: COLORS.textBody,
              fontSize: `${taglineBodySize}px`,
            }}
          >
            {taglineBody}
          </p>
        </div>

        {/* Price/features dark section */}
        <div
          className="absolute top-[685px] left-0 z-25 h-[350px] w-[600px] overflow-hidden"
          style={{
            clipPath: "polygon(0 0, 69% 0, 92.5% 100%, 0 100%)",
            color: COLORS.surface,
          }}
        >
          <img
            src={galleryPhotos[0]}
            alt="Property detail"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 px-8 py-6">
            <div
              className="font-bold uppercase"
              style={{
                fontSize: `${priceLabelSize}px`,
              }}
            >
              {priceLabel}
            </div>
            <div
              className="mt-1 text-[60px] leading-none font-bold"
              style={{ color: COLORS.secondary }}
            >
              {priceText}
            </div>
          </div>

          <div className="absolute bottom-0 z-10 px-8 py-6">
            <div className="text-[26px] font-bold uppercase">{fullAddress}</div>
            <div
              className="mt-1 text-[24px] leading-none"
              style={{ color: COLORS.secondary }}
            >
              {beds} Bed | {baths} Bath | {size ? `${size} SQM` : "SIZE N/A"}
            </div>
          </div>
        </div>

        {/* Floating photo cards */}
        <div
          className="absolute top-[810px] left-[500px] z-50"
          style={{
            width: 380,
            height: 286,
            background: COLORS.surface,
            clipPath: "polygon(0 0, 70% 0, 100% 100%, 30% 100%)",
          }}
        >
          <div
            className="h-full w-full overflow-hidden"
            style={{
              clipPath: "polygon(0 0, 70% 0, 100% 100%, 30% 100%)",
              transform: "scale(0.92)",
              transformOrigin: "center",
            }}
          >
            <img
              src={galleryPhotos[1]}
              alt="Property detail"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div
          className="absolute top-[950px] right-[20px] z-40"
          style={{
            width: 380,
            height: 286,
            background: COLORS.surface,
            clipPath: "polygon(0 0, 70% 0, 100% 100%, 30% 100%)",
          }}
        >
          <div
            className="h-full w-full overflow-hidden"
            style={{
              clipPath: "polygon(0 0, 70% 0, 100% 100%, 30% 100%)",
              transform: "scale(0.92)",
              transformOrigin: "center",
            }}
          >
            <img
              src={galleryPhotos[2]}
              alt="Property detail"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* About property */}
        <div className="absolute top-[1060px] right-8 left-8 z-20">
          <h3
            className="font-extrabold"
            style={{
              color: COLORS.primary,
              fontSize: `${aboutTitleSize}px`,
            }}
          >
            {aboutTitle}
          </h3>
          <p
            className="w-[70%] text-[17px] leading-[1.5] font-semibold"
            style={{ color: COLORS.textBody }}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div
          className="absolute right-0 bottom-0 left-0 z-30 grid h-[105px] grid-cols-[1.5fr_1.5fr_1.25fr_0.5fr] items-center px-8"
          style={{ background: COLORS.mutedBg }}
        >
          <div className="flex flex-row gap-3">
            <div
              className="bottom-3 left-8 h-[80px] w-[80px] overflow-hidden rounded-full border-1"
              style={{ borderColor: COLORS.primary }}
            >
              <img
                src={agentPhoto}
                alt={agentName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div
                className="truncate text-[26px] font-bold"
                style={{ color: COLORS.primary }}
              >
                {agentName}
              </div>
              <div
                className="tracking-wide uppercase"
                style={{
                  color: COLORS.primary,
                  fontSize: `${agentRoleSize}px`,
                }}
              >
                {agentRole}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center">
            <div
              className="-mt-1 flex h-12 w-16 items-center justify-center"
              style={{ color: COLORS.secondary }}
            >
              <LuCalendarClock className="h-12 w-12" />
            </div>
            <div
              className="flex flex-col justify-center leading-[1.15]"
              style={{ color: COLORS.primary }}
            >
              <div
                className="ml-1 font-semibold uppercase"
                style={{
                  fontSize: `${appointmentLabelSize}px`,
                }}
              >
                {appointmentLabel}
              </div>
              <div className="text-[28px] font-bold">{phone}</div>
            </div>
          </div>

          <div
            className="text-[11px] leading-[1.4] font-semibold"
            style={{ color: COLORS.textBody }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <div style={{ color: COLORS.secondary }}>
                <FaGlobe className="ml-0.25 h-3.5 w-3.5" />
              </div>
              <span className="max-w-[300px] truncate text-[16px]">
                {socialLink}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <div style={{ color: COLORS.secondary }}>
                <MailIcon />
              </div>
              <span className="max-w-[300px] truncate text-[16px]">
                {email}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-[80%] p-2" style={{ background: COLORS.surface }}>
              <img src={qrSrc} alt="QR code" className="h-[72px] w-[72px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
