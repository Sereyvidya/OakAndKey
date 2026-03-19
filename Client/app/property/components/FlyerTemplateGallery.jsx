"use client";

function cleanText(value) {
  return (value ?? "").toString().trim();
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

  const headline = "New Listing";
  const title =
    cleanText(formData.propertyTitle) || "Modern 4-Bedroom Family Home";
  const location =
    joinParts([formData.addressCity, formData.addressState]) ||
    cleanText(formData.address) ||
    "Austin, TX";

  const priceText = cleanText(formData.price)
    ? `$${formatPrice(formData.price)}`
    : "Contact for price";

  const beds = cleanText(formData.bedrooms) || "4";
  const baths = cleanText(formData.bathrooms) || "3";
  const size = cleanText(formData.size)
    ? `${cleanText(formData.size)} SQM`
    : "245 SQM";

  const overview =
    cleanText(formData.description) ||
    "Beautifully updated residence with open living spaces, refined finishes, and a layout designed for modern everyday living.";

  const brandName =
    cleanText(formData.agentCompanyName) || "Oak & Key Real Estate";
  const agentName = cleanText(formData.agentName) || "Listing Agent";
  const agentRole = cleanText(formData.agentRole) || "Residential Specialist";
  const phone =
    cleanText(formData.agentPhone) || "Phone available upon request";
  const email =
    cleanText(formData.agentEmail) || "Email available upon request";

  const companyLogo = pickSrc(formData.agentCompanyLogo);
  const agentPhoto = pickSrc(formData.agentPhoto);
  const socialLink = cleanText(formData.agentSocialLink);

  const qrSrc = socialLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        socialLink
      )}`
    : "";

  const gallery = (images || []).map(pickSrc).filter(Boolean);
  const hero = gallery[0] || "";
  const thumbs = gallery.slice(1, 6);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: COLORS.dark }}
    >
      <div className="relative h-full">
        {/* ribbon */}
        <div className="absolute top-0 left-13 z-20">
          <div className="relative flex h-[200px] w-[130px] items-start justify-center">
            <div className="absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
                  background: COLORS.beige,
                }}
              />
              <div
                className="absolute inset-[2px]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
                  background: COLORS.white,
                }}
              />

              <div className="absolute inset-0 z-10 flex items-start justify-center pt-8">
                <div className="flex h-full w-full flex-col items-center">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt="Company logo"
                      className="max-h-[100px] w-auto object-contain"
                    />
                  ) : (
                    <div className="text-center text-xs font-semibold text-black/60 uppercase">
                      {brandName || "Company Logo"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* hero image */}
        <svg
          className="absolute inset-0 z-0"
          viewBox="0 0 1080 1350"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="gallery-hero-clip">
              <path
                d="
      M 430 -120
      H 1080
      V 780
      C 920 720, 700 700, 470 600
      C 180 480, 180 140, 435 -120
      Z
    "
              />
            </clipPath>
          </defs>

          {hero ? (
            <image
              href={hero}
              x="0"
              y="0"
              width="1080"
              height="1350"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#gallery-hero-clip)"
            />
          ) : (
            <g clipPath="url(#gallery-hero-clip)">
              <rect x="0" y="0" width="1080" height="1350" fill="#e5e7eb" />
              <text
                x="660"
                y="520"
                textAnchor="middle"
                fill="#6b7280"
                fontSize="28"
                fontFamily="Arial, sans-serif"
              >
                Upload hero image
              </text>
            </g>
          )}
        </svg>

        {/* beige swoosh */}
        <svg
          className="pointer-events-none absolute inset-0 z-10"
          viewBox="0 0 1080 1350"
          preserveAspectRatio="none"
        >
          <path
            d="
          M 435 -120
          C 180 140, 180 480, 470 600
          C 700 700, 920 720, 1080 780
          L 1080 1000
          C 980 860, 750 840, 500 720
          C 150 550, 150 180, 430 -120
          Z
        "
            fill="#beb491"
          />
        </svg>
      </div>
    </div>
  );
}
