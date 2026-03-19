"use client";

import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

function cleanText(v) {
  return (v ?? "").toString().trim();
}

function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "";
  const num = Number(price);
  if (Number.isNaN(num)) return String(price);
  return num.toLocaleString("en-US");
}

function pickSrc(img) {
  return img?.preview || img?.src || img?.url || "";
}

const PhoneIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.24 1.02l-1.27 1.27a16 16 0 006.59 6.59l1.27-1.27a1 1 0 011.02-.24l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
    />
  </svg>
);

export default function FlyerTemplateShowcase({ formData, images }) {
  const COLORS = {
    page: "#ffffff",
    dark: "#191d24",
    darkAlt: "#171c24",
    beige: "#beb491",
    textMain: "#141414",
    textBody: "#2e3138",
    textSection: "#1c1f26",
    mutedBg: "#ececec",
    white: "#ffffff",
    black: "#000000",
  };
  const title = cleanText(formData.propertyTitle) || "NEW HOME FOR SALE";
  const address =
    cleanText(formData.addressCity) + ", " + cleanText(formData.addressState);
  const description =
    cleanText(formData.description) ||
    "This spacious residence offers a practical floor plan, bright interiors, and quality finishes for modern family living.";
  const priceText = cleanText(formData.price)
    ? `$${formatPrice(formData.price)}`
    : "Contact for price";

  const beds = formData.bedrooms !== "" ? Number(formData.bedrooms) : null;
  const baths = formData.bathrooms !== "" ? Number(formData.bathrooms) : null;
  const size = formData.size !== "" ? Number(formData.size) : null;

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
  const qrSrc = socialLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        socialLink
      )}`
    : "";

  return (
    <div
      className={`${josefin.className} absolute inset-0 p-4`}
      style={{ background: COLORS.page }}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="relative h-[105px] w-full">
          <div
            className="absolute top-0 right-0 h-full w-105"
            style={{ background: COLORS.beige }}
          />
          <div
            className={`relative flex h-full items-center px-6 pt-3 text-center text-[40px] font-medium tracking-[0.14em] text-[#beb491] uppercase`}
            style={{
              color: COLORS.beige,
              background: COLORS.dark,
              clipPath: `polygon(0 0, calc(100% - 105px) 0, 100% 100%, 0 100%)`,
            }}
          >
            {agentCompanyName}
          </div>
        </div>

        {/* Hero: use grid (photo left, info right) */}
        <div className="relative mt-3 h-140 w-full overflow-hidden">
          {/* Hero Image */}
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

          {/* Square Beige Card */}
          <div
            className="absolute right-0 bottom-0 flex aspect-square w-[340px] flex-col justify-center p-6"
            style={{ background: COLORS.beige, color: COLORS.textMain }}
          >
            <div className="font-regular text-[44px] leading-[1] uppercase">
              NEW HOME FOR SALE
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
              {beds ?? "—"} BED | {baths ?? "—"} BATH |{" "}
              {size ? `${size} SQM` : "SIZE N/A"}
            </div>
          </div>
        </div>

        {/* Section title line */}
        <div className="-mt-10 flex w-120 flex-col gap-3">
          <div
            className="w-full text-center text-[32px] font-semibold tracking-[0.08em] uppercase"
            style={{ color: COLORS.textSection }}
          >
            Property Overview
          </div>
          <div className="h-[2px] w-full" style={{ background: COLORS.dark }} />
        </div>

        {/* Thumbnails strip */}
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
            className="grid h-[150px] grid-cols-[220px_1fr] items-stretch text-white"
            style={{ color: COLORS.white }}
          >
            <div className="flex items-center justify-center bg-white">
              <div className="flex h-[150px] w-full items-center justify-center">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-sm font-semibold text-black/60 uppercase">
                    {agentCompanyName || "Company Logo"}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute right-0 bottom-0 left-[75px] h-[130px] min-w-0 pl-25"
                style={{ background: COLORS.darkAlt }}
              >
                <div className="flex h-[130px] w-full flex-col py-2">
                  <div
                    className="truncate text-[36px] font-semibold"
                    style={{ color: COLORS.beige }}
                  >
                    {agentName}
                  </div>
                  <div className="text-[14px] tracking-wide text-white uppercase">
                    RESIDENTIAL SPECIALIST{" "}
                    {agentCompanyName ? `| ${agentCompanyName}` : ""}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[20px]">
                    {phone ? (
                      <div className="flex items-center gap-2">
                        <div style={{ color: COLORS.beige }}>
                          <PhoneIcon className="h-10 w-10" />
                        </div>
                        <span>{phone}</span>
                      </div>
                    ) : null}
                    {email ? (
                      <div className="flex min-w-0 items-center gap-2">
                        <div style={{ color: COLORS.beige }}>
                          <MailIcon />
                        </div>
                        <span className="max-w-[300px] truncate">{email}</span>
                      </div>
                    ) : null}
                    {/* {socialLink ? (
                      <div className="flex min-w-0 items-center gap-2 text-white/80">
                        <Globe className="h-4 w-4" />
                        <span className="max-w-[240px] truncate text-[16px]">
                          {socialLink}
                        </span>
                      </div>
                    ) : null} */}
                  </div>
                </div>
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt="Social or website QR code"
                    className="right absolute top-1/2 right-2 h-[110px] w-[110px] -translate-y-1/2 object-contain"
                  />
                ) : (
                  <div className="text-center text-xs text-red-600">QR</div>
                )}
              </div>
              {agentPhoto ? (
                <img
                  src={agentPhoto}
                  alt="Agent profile"
                  className="absolute top-0 h-[150px] w-[150px] rounded-full object-cover ring-2 ring-white/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-xs">
                  Agent
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
