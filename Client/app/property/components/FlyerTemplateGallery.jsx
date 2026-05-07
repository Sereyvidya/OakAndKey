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
  const galleryPhotos = gallery.slice(1, 7);
  const photoCount = galleryPhotos.length;

  const galleryConfig =
    photoCount <= 3
      ? { cols: photoCount || 3, gap: 22, height: 170 }
      : photoCount === 4
        ? { cols: 4, gap: 18, height: 150 }
        : photoCount === 5
          ? { cols: 5, gap: 14, height: 135 }
          : { cols: 6, gap: 12, height: 125 };

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

            <div className="absolute inset-0 flex flex-col items-center pt-10">
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
              <div
                style={{
                  color: COLORS.dark,
                }}
              >
                {agentCompanyName}
              </div>
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
          <div className="grid grid-cols-[300px_640px]">
            <div className="flex flex-col justify-center gap-3">
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

            <p className="w-[640px] text-[18px] leading-[1.55] tracking-[0.01em] text-white">
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
                className="overflow-hidden rounded-sm border border-white/25 bg-white/10 shadow-lg"
                style={{ height: `${galleryConfig.height}px` }}
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

        {/* Footer (agent) */}
        <div className="absolute right-0 bottom-3 left-0 z-30 h-[145px] bg-[#171c24]">
          <div className="relative h-full px-[50px] py-5 text-white">
            {/* Agent photo */}
            {agentPhoto && (
              <div className="absolute bottom-3 left-[50px] h-[120px] w-[120px] overflow-hidden rounded-full bg-white shadow-xl">
                <img
                  src={agentPhoto}
                  alt={agentName}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Agent info */}
            <div className="ml-[150px] flex w-full flex-col">
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
              </div>
            </div>

            {/* QR code */}
            {qrSrc && (
              <div className="absolute top-1/2 right-[50px] flex -translate-y-1/2 items-center gap-4">
                <div className="text-right"></div>

                <div className="rounded-md bg-white p-2 shadow-lg">
                  <img
                    src={qrSrc}
                    alt="QR code"
                    className="h-[92px] w-[92px]"
                  />
                </div>
              </div>
            )}

            {/* top accent line */}
            {/* <div
              className="absolute top-0 right-0 left-0 h-[3px]"
              style={{ background: COLORS.beige }}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
