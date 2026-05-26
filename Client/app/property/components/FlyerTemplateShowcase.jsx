"use client";

import { Josefin_Sans } from "next/font/google";
import {
  cleanText,
  formatPrice,
  pickSrc,
  joinParts,
} from "@/app/lib/flyer/format";
import { FLYER_COLORS } from "@/app/lib/flyer/theme";
import { PhoneIcon, MailIcon } from "./FlyerIcons";
import { FaGlobe } from "react-icons/fa";
import DefaultCompanyLogo from "./DefaultCompanyLogo";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function FlyerTemplateShowcase({
  formData,
  images,
  theme = FLYER_COLORS,
  templateCopy = {},
}) {
  const COLORS = theme;
  const copy = templateCopy?.showcase || {};

  const headline = cleanText(copy.headline?.text) || "New Home For Sale";
  const headlineSize = copy.headline?.size || 44;

  const sectionTitle =
    cleanText(copy.sectionTitle?.text) || "Property Overview";
  const sectionTitleSize = copy.sectionTitle?.size || 32;

  const agentRole = cleanText(copy.agentRole?.text) || "Residential Specialist";
  const agentRoleSize = copy.agentRole?.size || 14;

  const address = joinParts([formData.addressCity, formData.addressState]);
  const description =
    cleanText(formData.description) ||
    "This spacious residence offers a practical floor plan, bright interiors, and quality finishes for modern family living.";
  const priceText = cleanText(formData.price)
    ? `$${formatPrice(formData.price)}`
    : "Contact for price";

  const beds = formData.bedrooms !== "" ? Number(formData.bedrooms) : null;
  const baths = formData.bathrooms !== "" ? Number(formData.bathrooms) : null;
  const size = formData.size !== "" ? Number(formData.size) : null;
  const sizeUnit = formData.sizeUnit;

  const hero = pickSrc(images?.[0]);
  const t1 = pickSrc(images?.[1]);
  const t2 = pickSrc(images?.[2]);
  const t3 = pickSrc(images?.[3]);

  const agentName = cleanText(formData.agentName) || "Listing Agent";
  const agentCompanyName = cleanText(formData.agentCompanyName);
  const socialLink = cleanText(formData.agentSocialLink);
  const phone = cleanText(formData.agentPhone);
  const email = cleanText(formData.agentEmail);
  const agentPhoto = pickSrc(formData.agentPhoto);
  const companyLogo = pickSrc(formData.agentCompanyLogo);
  const isDefaultLogo = formData.agentCompanyLogo?.type === "default-svg-logo";
  const qrSrc = socialLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        socialLink
      )}`
    : "";

  return (
    <div
      className={`${josefin.className} absolute inset-0 p-4`}
      style={{ background: COLORS.surface }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="relative h-[105px] w-full">
          <div
            className="absolute top-0 right-0 h-full w-105"
            style={{ background: COLORS.secondary }}
          />
          <div
            className="relative flex h-full items-center px-6 pt-3 text-center text-[40px] font-medium tracking-[0.14em] uppercase"
            style={{
              color: COLORS.secondary,
              background: COLORS.primary,
              clipPath: `polygon(0 0, calc(100% - 105px) 0, 100% 100%, 0 100%)`,
            }}
          >
            {agentCompanyName}
          </div>
        </div>

        {/* Hero */}
        <div className="relative mt-3 h-140 w-full overflow-hidden">
          {hero ? (
            <img
              src={hero}
              alt="Main property"
              className="top-0 h-120 w-full object-cover"
            />
          ) : (
            <div
              className="flex h-[450px] items-center justify-center text-sm"
              style={{ background: COLORS.mutedBg, color: `${COLORS.black}80` }}
            >
              Upload main property image
            </div>
          )}

          {/* Info Card */}
          <div
            className="absolute right-0 bottom-0 flex aspect-square w-[340px] flex-col justify-center p-6"
            style={{ background: COLORS.secondary, color: COLORS.textMain }}
          >
            <div
              className="font-regular leading-[1] uppercase"
              style={{ fontSize: `${headlineSize}px` }}
            >
              {headline}
            </div>

            <div className="font-regular mt-2 text-[30px] tracking-wide uppercase">
              {address}
            </div>

            <div
              className="mt-4 h-[2px] w-full"
              style={{ background: COLORS.black }}
            />

            <div className="mt-4 text-[50px] leading-none font-light">
              {priceText}
            </div>

            <div className="mt-3 text-[20px] tracking-wide uppercase">
              {beds ?? "—"} BED | {baths ?? "—"} BATH | {size} {sizeUnit}
            </div>
          </div>
        </div>

        {/* Section title line */}
        <div className="-mt-10 flex w-120 flex-col gap-3">
          <div
            className="w-full text-center font-semibold tracking-[0.08em] uppercase"
            style={{
              color: COLORS.primary,
              fontSize: `${sectionTitleSize}px`,
            }}
          >
            {sectionTitle}
          </div>
          <div
            className="h-[2px] w-full"
            style={{ background: COLORS.primary }}
          />
        </div>

        {/* Thumbnails */}
        <div className="mt-6 grid h-[250px] grid-cols-3 gap-3">
          {[t1, t2, t3].map((src, idx) => (
            <div
              key={idx}
              className="overflow-hidden border border-black/10"
              style={{ background: COLORS.mutedBg }}
            >
              {src ? (
                <img
                  src={src}
                  alt={`Property detail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center text-xs"
                  style={{ color: `${COLORS.black}66` }}
                >
                  Photo
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center">
            <p
              className="w-full text-[20px] leading-[1.6] font-semibold"
              style={{ color: COLORS.textBody }}
            >
              {description}
            </p>
          </div>

          <div
            className="grid h-[150px] grid-cols-[190px_1fr] items-stretch"
            style={{ color: COLORS.surface }}
          >
            <div
              className="flex items-center justify-center"
              style={{ background: COLORS.surface }}
            >
              <div className="flex h-[150px] w-full items-center justify-center">
                {isDefaultLogo ? (
                  <DefaultCompanyLogo
                    primary={COLORS.primary}
                    secondary={COLORS.secondary}
                    className="h-full w-full"
                  />
                ) : companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div
                    className="text-center text-sm font-semibold uppercase"
                    style={{ color: `${COLORS.black}99` }}
                  >
                    {agentCompanyName || "Company Logo"}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute right-0 bottom-0 left-[75px] h-[130px] min-w-0 pl-25"
                style={{ background: COLORS.primary }}
              >
                <div className="flex h-[130px] w-full flex-col py-2">
                  <div
                    className="truncate text-[36px] font-semibold"
                    style={{ color: COLORS.secondary }}
                  >
                    {agentName}
                  </div>

                  <div
                    className="tracking-wide uppercase"
                    style={{
                      color: COLORS.surface,
                      fontSize: `${agentRoleSize}px`,
                    }}
                  >
                    {agentRole} | {agentCompanyName}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[18px]">
                    <div className="flex items-center gap-2">
                      <div style={{ color: COLORS.secondary }}>
                        <PhoneIcon className="h-10 w-10" />
                      </div>
                      <span>{phone}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <div style={{ color: COLORS.secondary }}>
                        <MailIcon />
                      </div>
                      <span className="max-w-[300px] truncate">{email}</span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <div style={{ color: COLORS.secondary }}>
                        <FaGlobe className="ml-0.25 h-3.5 w-3.5" />
                      </div>
                      <span className="max-w-[300px] truncate">
                        {socialLink}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-4">
                  <div style={{ background: COLORS.surface }} className="p-2">
                    <img
                      src={qrSrc}
                      alt="QR code"
                      className="h-[92px] w-[92px]"
                    />
                  </div>
                </div>
              </div>

              <img
                src={agentPhoto}
                alt="Agent profile"
                className="absolute top-0 left-0 h-[150px] w-[150px] rounded-full object-cover ring-2 ring-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
