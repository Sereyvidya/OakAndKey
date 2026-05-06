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

function joinParts(parts) {
  return parts.map(cleanText).filter(Boolean).join(", ");
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

export default function FlyerTemplateGallery({ formData, images }) {
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

  const title = cleanText(formData.propertyTitle) || "New Listing";
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
  const thumbs = gallery.slice(1, 5);

  const agentName = cleanText(formData.agentName) || "Listing Agent";
  const agentCompanyName = cleanText(formData.agentCompanyName);
  const phone = cleanText(formData.agentPhone);
  const email = cleanText(formData.agentEmail);
  const agentPhoto = pickSrc(formData.agentPhoto);
  const companyLogo = pickSrc(formData.agentCompanyLogo);
  const socialLink = cleanText(formData.agentSocialLink);

  const qrSrc = socialLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(socialLink)}`
    : "";

  return (
    <div
      className={`${josefin.className} absolute inset-0`}
      style={{ background: COLORS.dark }}
    >
      <div className="relative h-full">
        {/* Ribbon (logo) */}
        <div className="absolute top-0 left-[50px] z-20">
          <div className="relative h-[200px] w-[130px]">
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
                background: COLORS.beige,
              }}
            />
            <div
              className="absolute inset-[2px]"
              style={{
                clipPath: "polygon(0 0,100% 0,100% 78%,50% 100%,0 78%)",
                background: COLORS.white,
              }}
            />

            <div className="absolute inset-0 flex items-start justify-center pt-8">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company logo"
                  className="max-h-[100px] object-contain"
                />
              ) : (
                <div className="text-center text-xs font-semibold text-black/60 uppercase">
                  {agentCompanyName || "Company Logo"}
                </div>
              )}
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
            <image
              href={hero}
              width="1080"
              height="1350"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#gallery-hero-clip)"
            />
          ) : (
            <rect width="1080" height="1350" fill="#e5e7eb" />
          )}
        </svg>

        {/* Beige swoosh */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 1080 1350"
          preserveAspectRatio="none"
        >
          <path
            d="M435 -120 C180 140,180 480,470 600 C700 700,920 720,1080 780 L1080 1000 C980 860,750 840,500 720 C150 550,150 180,430 -120 Z"
            fill={COLORS.beige}
          />
        </svg>

        {/* Left content */}
        <div className="absolute top-[300px] left-[115px] z-20 inline-block -translate-x-1/2 text-center">
          <div className="text-[20px] leading-none text-white">Offered at</div>
          <div className="mt-3 text-[44px] leading-none font-semibold whitespace-nowrap text-white">
            {priceText}
          </div>
        </div>

        <div className="absolute top-[510px] left-[50px] z-20 w-[470px]">
          <div
            className="mt-16 text-[100px] leading-[0.75] italic"
            style={{ color: COLORS.beige, fontFamily: "Georgia, serif" }}
          >
            New
          </div>
          <div className="mt-3 text-[70px] leading-[0.82] tracking-[0.04em] text-white uppercase">
            Listing
          </div>

          <div
            className="mt-5 text-[30px] leading-tight font-medium"
            style={{ color: COLORS.beige }}
          >
            {fullAddress}
          </div>
        </div>

        {/* Description */}
        <div className="absolute top-[800px] left-[50px] z-20">
          <div className="grid grid-cols-[320px_640px]">
            <div className="my-auto flex flex-col gap-3">
              <div
                className="text-[46px] leading-none whitespace-nowrap text-white italic"
                style={{ fontFamily: "Georgia, serif" }}
              >
                The Property
              </div>

              <div
                className="text-[18px] tracking-[0.03em] whitespace-nowrap uppercase"
                style={{ color: COLORS.beige }}
              >
                {beds ?? "—"} Bed | {baths ?? "—"} Bath |{" "}
                {size ? `${size} SQM` : "N/A"}
              </div>
            </div>

            <p className="w-[640px] text-[16px] leading-[1.55] tracking-[0.01em] text-white">
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

        {/* Thumbnails */}
        <div className="absolute right-[300px] bottom-[165px] left-[60px] z-20 grid grid-cols-3 gap-4">
          {thumbs.map((src, i) => (
            <div key={i} className="overflow-hidden border border-white/20">
              {src ? (
                <img src={src} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-white/60">
                  Photo
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer (agent) */}
        <div className="absolute right-0 bottom-0 left-0 grid h-[140px] grid-cols-[220px_1fr]">
          <div className="flex items-center justify-center bg-white">
            {companyLogo ? (
              <img src={companyLogo} className="max-h-full object-contain" />
            ) : (
              <div className="text-sm text-black/60">Logo</div>
            )}
          </div>

          <div className="relative flex flex-col justify-center bg-[#171c24] pr-[140px] pl-[90px] text-white">
            <div className="text-[28px] font-semibold text-[#beb491]">
              {agentName}
            </div>
            <div className="text-[12px] uppercase">
              RESIDENTIAL SPECIALIST{" "}
              {agentCompanyName ? `| ${agentCompanyName}` : ""}
            </div>

            <div className="mt-2 flex gap-4 text-[14px]">
              {phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon /> {phone}
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <MailIcon /> {email}
                </div>
              )}
            </div>

            {qrSrc && (
              <img
                src={qrSrc}
                className="absolute top-1/2 right-4 h-[90px] w-[90px] -translate-y-1/2"
              />
            )}

            {agentPhoto && (
              <img
                src={agentPhoto}
                className="absolute top-0 left-0 h-[140px] w-[140px] rounded-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
