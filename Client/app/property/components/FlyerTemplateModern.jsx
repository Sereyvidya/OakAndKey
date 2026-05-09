"use client";

import { Josefin_Sans } from "next/font/google";
import {
  cleanText,
  formatPrice,
  pickSrc,
  joinParts,
} from "@/app/lib/flyer/format";
import { FLYER_COLORS as COLORS } from "@/app/lib/flyer/theme";
import { PhoneIcon, MailIcon, CalendarIcon } from "./FlyerIcons";
import { LuCalendarClock } from "react-icons/lu";
import { FaGlobe } from "react-icons/fa";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function FlyerTemplateGallery({ formData, images }) {
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
      className={`${josefin.className} absolute inset-0 overflow-hidden`}
      style={{ background: COLORS.page }}
    >
      <div className="relative flex h-full flex-col overflow-hidden bg-white">
        {/* Dark banner */}
        <div
          className="h-[120px] w-full"
          style={{ backgroundColor: COLORS.dark }}
        ></div>

        {/* Top right label */}
        <div className="absolute top-[35px] right-[50px] z-20 text-right">
          <div
            className="text-4xl font-semibold tracking-wide uppercase"
            style={{ color: COLORS.beige }}
          >
            {agentCompanyName}
          </div>
          <div
            className="mt-1 h-[3px] w-full"
            style={{ background: COLORS.beige }}
          />
        </div>

        {/* Logo block */}
        <div
          className="absolute top-22 left-8 z-30 flex h-[150px] w-[150px] items-center justify-center rounded-lg p-2"
          style={{
            backgroundColor: COLORS.white,
            borderColor: COLORS.beige,
          }}
        >
          <img
            src={companyLogo}
            alt="Company logo"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Hero image */}
        <div
          className="absolute top-[110px] right-0 h-[885px] w-[82%]"
          style={{
            borderColor: COLORS.beige,
          }}
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
            background: COLORS.beige,
            clipPath: "polygon(0 0, 50% 0, 87% 100%, 0 100%)",
          }}
        />

        {/* White angled panel */}
        <div
          className="absolute top-[60px] left-0 z-15 h-[955px] w-[620px] border-t-5 bg-white"
          style={{
            clipPath: "polygon(0 0, 28% 0, 90% 100%, 0 100%)",
            borderColor: COLORS.beige,
          }}
        />

        {/* Title card */}
        <div
          className="absolute top-[250px] left-14 z-30 flex w-[620px] justify-center py-5 text-center"
          style={{ background: COLORS.beige }}
        >
          <div className="w-fit">
            <div
              className="text-[64px] leading-[0.95] font-normal text-white"
              style={{ color: COLORS.dark }}
            >
              Modern Home
            </div>
            <div
              className="text-[78px] leading-[0.95] font-bold tracking-tight text-white uppercase"
              style={{ color: COLORS.dark }}
            >
              FOR SALE
            </div>
          </div>
        </div>

        {/* Intro text */}
        <div className="absolute top-[480px] left-14 z-30 w-[285px]">
          <h2
            className="text-[32px] leading-[1.05] font-bold"
            style={{ color: COLORS.textMain }}
          >
            A Home That Fits
            <br />
            Your Lifestyle
          </h2>
          <p className="mt-3 text-[19px] font-semibold">
            Enjoy spacious interiors, modern touches, and a layout designed for
            convenience and comfort.
          </p>
        </div>

        {/* Price/features dark section */}
        <div
          className="absolute top-[685px] left-0 z-25 h-[350px] w-[600px] overflow-hidden text-white"
          style={{
            clipPath: "polygon(0 0, 69% 0, 92.5% 100%, 0 100%)",
          }}
        >
          {/* Background image */}
          <img
            src={galleryPhotos[0]}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dim overlay */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 px-8 py-6">
            <div className="text-[30px] font-bold uppercase">Offered At</div>
            <div
              className="mt-1 text-[60px] leading-none font-bold"
              style={{ color: COLORS.beige }}
            >
              {priceText}
            </div>
          </div>
          <div className="absolute bottom-0 z-10 px-8 py-6">
            <div className="text-[26px] font-bold uppercase">{fullAddress}</div>
            <div
              className="mt-1 text-[24px] leading-none"
              style={{ color: COLORS.beige }}
            >
              {beds} Bed | {baths} Bath | {`${size} SQM`}
            </div>
          </div>
        </div>

        {/* Floating photo cards */}
        <div
          className="absolute top-[810px] left-[500px] z-50"
          style={{
            width: 380,
            height: 286,
            background: COLORS.white,
            clipPath: "polygon(0 0, 70% 0, 100% 100%, 30% 100%)",
          }}
        >
          <div
            className="overflow-hidden"
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
            background: COLORS.white,
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
            className="text-[30px] font-extrabold"
            style={{ color: COLORS.textSection }}
          >
            About The Property
          </h3>
          <p className="w-[70%] text-[17px] leading-[1.5] font-semibold text-black/70">
            {description}
          </p>
        </div>

        {/* Footer*/}
        <div
          className="absolute right-0 bottom-0 left-0 z-30 grid h-[105px] grid-cols-[1.5fr_1.5fr_1.25fr_0.5fr] items-center px-8"
          style={{ background: COLORS.mutedBg }}
        >
          <div className="flex flex-row gap-3">
            <div
              className="bottom-3 left-8 h-[80px] w-[80px] overflow-hidden rounded-full border-1"
              style={{ borderColor: COLORS.dark }}
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
                style={{ color: COLORS.dark }}
              >
                {agentName}
              </div>
              <div
                className="text-[14px] tracking-wide text-white uppercase"
                style={{ color: COLORS.dark }}
              >
                RESIDENTIAL SPECIALIST
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center">
            <div
              className="-mt-1 flex h-12 w-16 items-center justify-center"
              style={{ color: COLORS.beige }}
            >
              <LuCalendarClock className="h-12 w-12" />
            </div>
            <div
              className="flex flex-col justify-center leading-[1.15]"
              style={{ color: COLORS.dark }}
            >
              <div className="ml-1 text-[12px] font-semibold uppercase">
                Call for appointment
              </div>
              <div className="text-[28px] font-bold">{phone}</div>
            </div>
          </div>

          <div className="text-[11px] leading-[1.4] font-semibold text-black/70">
            <div className="flex min-w-0 items-center gap-2">
              <div style={{ color: COLORS.beige }}>
                <FaGlobe className="ml-0.25 h-3.5 w-3.5" />
              </div>
              <span className="max-w-[300px] truncate text-[16px]">
                {socialLink}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <div style={{ color: COLORS.beige }}>
                <MailIcon />
              </div>
              <span className="max-w-[300px] truncate text-[16px]">
                {email}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-[80%] bg-white p-2">
              <img src={qrSrc} className="h-[72px] w-[72px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
