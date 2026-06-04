"use client";

import { Josefin_Sans } from "next/font/google";
import { cleanText } from "@/app/lib/listing/format";
import { buildFlyerViewModel } from "@/app/lib/flyer/viewModel";
import { FLYER_COLORS } from "@/app/lib/flyer/theme";
import { PhoneIcon, MailIcon } from "./FlyerIcons";
import { FaGlobe } from "react-icons/fa";
import CompanyLogoBlock from "./CompanyLogoBlock";
import ContactLine from "./ContactLine";
import QrCode from "./QrCode";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function FlyerTemplateGallery({
  formData,
  images,
  theme = FLYER_COLORS,
  templateCopy = {},
}) {
  const COLORS = theme;
  const copy = templateCopy?.gallery || {};

  const priceLabel = cleanText(copy.priceLabel?.text) || "Offered at";
  const priceLabelSize = copy.priceLabel?.size || 20;

  const headlineScript = cleanText(copy.headlineScript?.text) || "New";
  const headlineScriptSize = copy.headlineScript?.size || 100;

  const headlineMain = cleanText(copy.headlineMain?.text) || "Listing";
  const headlineMainSize = copy.headlineMain?.size || 70;

  const propertyTitle = cleanText(copy.propertyTitle?.text) || "The Property";
  const propertyTitleSize = copy.propertyTitle?.size || 46;

  const agentRole = cleanText(copy.agentRole?.text) || "Residential Specialist";
  const agentRoleSize = copy.agentRole?.size || 14;

  const {
    fullAddress,
    description,
    priceText,
    beds,
    baths,
    size,
    sizeUnit,
    hero,
    galleryPhotos,
    agentName,
    agentCompanyName,
    phone,
    email,
    agentPhoto,
    companyLogo,
    isDefaultLogo,
    socialLink,
    qrSrc,
  } = buildFlyerViewModel(formData, images);

  const photoCount = galleryPhotos.length;

  const galleryConfig =
    photoCount <= 3
      ? { cols: photoCount || 3, gap: 22, height: 170 }
      : photoCount === 4
        ? { cols: 4, gap: 18, height: 150 }
        : photoCount === 5
          ? { cols: 5, gap: 14, height: 135 }
          : { cols: 6, gap: 12, height: 125 };

  return (
    <div
      className={`${josefin.className} absolute inset-0`}
      style={{ background: COLORS.primary }}
    >
      <div className="relative h-full">
        {/* Ribbon */}
        <div className="absolute top-0 left-[50px] z-20">
          <div className="relative h-[200px] w-[130px]">
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
                background: COLORS.secondary,
              }}
            />
            <div
              className="absolute inset-[2px]"
              style={{
                clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
                background: COLORS.surface,
              }}
            />

            <div className="absolute inset-0 flex flex-col items-center pt-8">
              <CompanyLogoBlock
                isDefaultLogo={isDefaultLogo}
                companyLogo={companyLogo}
                agentCompanyName={agentCompanyName}
                colors={COLORS}
                logoClassName="h-[92px] w-full"
              />

              <div style={{ color: COLORS.primary }}>{agentCompanyName}</div>
            </div>
          </div>
        </div>

        {/* Hero clipped image */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 1080 1350"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="gallery-hero-clip">
              <path d="M430 -120 H1080 V780 C920 720,700 700,470 600 C180 480,180 140,435 -120 Z" />
            </clipPath>
          </defs>

          {hero ? (
            <g clipPath="url(#gallery-hero-clip)">
              <image
                href={hero}
                x="200"
                y="0"
                width="880"
                height="780"
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          ) : (
            <rect width="1080" height="1350" fill={COLORS.mutedBg} />
          )}
        </svg>

        {/* Swoosh */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 1080 1350"
          preserveAspectRatio="none"
        >
          <path
            d="M435 -120 C180 140,180 480,470 600 C700 700,920 720,1080 780 L1080 1000 C980 860,750 840,500 720 C150 550,150 180,430 -120 Z"
            fill={COLORS.secondary}
          />
        </svg>

        {/* Left content */}
        <div className="absolute top-[300px] left-[115px] z-20 inline-block -translate-x-1/2 text-center">
          <div
            className="leading-none"
            style={{
              color: COLORS.surface,
              fontSize: `${priceLabelSize}px`,
            }}
          >
            {priceLabel}
          </div>
          <div
            className="mt-3 text-[44px] leading-none font-semibold whitespace-nowrap"
            style={{ color: COLORS.surface }}
          >
            {priceText}
          </div>
        </div>

        <div className="absolute top-[510px] left-[50px] z-20 w-[470px]">
          <div
            className="mt-16 leading-[0.75] italic"
            style={{
              color: COLORS.secondary,
              fontFamily: "Georgia, serif",
              fontSize: `${headlineScriptSize}px`,
            }}
          >
            {headlineScript}
          </div>

          <div
            className="mt-3 leading-[0.82] tracking-[0.04em] uppercase"
            style={{
              color: COLORS.surface,
              fontSize: `${headlineMainSize}px`,
            }}
          >
            {headlineMain}
          </div>

          <div
            className="mt-5 text-[30px] leading-tight font-medium"
            style={{ color: COLORS.secondary }}
          >
            {fullAddress}
          </div>
        </div>

        {/* Description */}
        <div className="absolute top-[800px] left-[50px] z-20">
          <div className="grid grid-cols-[300px_640px]">
            <div className="flex flex-col justify-center gap-3">
              <div
                className="leading-none whitespace-nowrap italic"
                style={{
                  color: COLORS.surface,
                  fontFamily: "Georgia, serif",
                  fontSize: `${propertyTitleSize}px`,
                }}
              >
                {propertyTitle}
              </div>

              <div
                className="text-[18px] tracking-[0.03em] whitespace-nowrap uppercase"
                style={{ color: COLORS.secondary }}
              >
                {beds} BED | {baths} BATH | {size} {sizeUnit}
              </div>
            </div>

            <p
              className="w-[640px] text-[18px] leading-[1.55] tracking-[0.01em]"
              style={{ color: COLORS.surface }}
            >
              <span
                className="float-right h-[150px] w-[320px]"
                style={{
                  shapeOutside:
                    "polygon(100% 0, 100% 100%, 90% 75%, 56% 45%, 0% 0)",
                }}
              />
              {description}
            </p>
          </div>
        </div>

        {/* Gallery photos */}
        <div className="absolute right-[50px] bottom-[165px] left-[50px] z-20">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${galleryConfig.cols}, minmax(0, 1fr))`,
              gap: `${galleryConfig.gap}px`,
            }}
          >
            {galleryPhotos.map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-sm shadow-lg"
                style={{
                  height: `${galleryConfig.height}px`,
                  background: `${COLORS.surface}1A`,
                  border: `1px solid ${COLORS.surface}40`,
                }}
              >
                <img
                  src={src}
                  alt={`Property photo ${i + 2}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="absolute right-0 bottom-3 left-0 z-30 h-[145px]"
          style={{ background: COLORS.primary }}
        >
          <div
            className="relative h-full px-[50px] py-5"
            style={{ color: COLORS.surface }}
          >
            <div
              className="absolute bottom-3 left-[50px] h-[120px] w-[120px] overflow-hidden rounded-full shadow-xl"
              style={{ background: COLORS.surface }}
            >
              <img
                src={agentPhoto}
                alt={agentName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="ml-[150px] flex w-full flex-col">
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

              <div className="mt-2 flex flex-wrap items-center gap-4 text-[20px]">
                <ContactLine
                  icon={<PhoneIcon className="h-10 w-10" />}
                  iconColor={COLORS.secondary}
                  className="flex items-center gap-2"
                  textClassName=""
                >
                  {phone}
                </ContactLine>

                <ContactLine icon={<MailIcon />} iconColor={COLORS.secondary}>
                  {email}
                </ContactLine>

                <ContactLine
                  icon={<FaGlobe className="ml-0.25 h-3.5 w-3.5" />}
                  iconColor={COLORS.secondary}
                >
                  {socialLink}
                </ContactLine>
              </div>
            </div>

            <div className="absolute top-1/2 right-[50px] flex -translate-y-1/2 items-center gap-4">
              <div
                className="rounded-md p-2 shadow-lg"
                style={{ background: COLORS.surface }}
              >
                <QrCode src={qrSrc} className="h-[92px] w-[92px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
