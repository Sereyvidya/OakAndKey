"use client";

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
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.24 1.02l-1.27 1.27a16 16 0 006.59 6.59l1.27-1.27a1 1 0 011.02-.24l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z"
    />
  </svg>
);

const MailIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
    />
  </svg>
);

export default function FlyerTemplateHero({ formData, images }) {
  const title = cleanText(formData.propertyTitle) || "NEW HOME FOR SALE";
  const address = cleanText(formData.address) || "Prime residential area";
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
  const phone = cleanText(formData.agentPhone);
  const email = cleanText(formData.agentEmail);
  const agentPhoto = pickSrc(formData.agentPhoto);

  return (
    <div className="absolute inset-0 bg-[#e6e6e6] p-7">
      <div className="h-full rounded-[4px] border-[8px] border-white bg-white p-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)]">
        <div className="flex h-full flex-col">
          <div className="bg-[#191d24] px-6 py-3 text-[34px] font-semibold tracking-[0.08em] text-white uppercase">
            Angkor Realty Company
          </div>

          <div className="relative mt-2 h-[430px] overflow-hidden">
            {hero ? (
              <img src={hero} alt="Main property" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-[#ece9e2] text-sm text-[#7f7566]">Upload main property image</div>
            )}

            <div className="absolute right-0 bottom-0 w-[410px] bg-[#cbc19e] p-5 text-[#141414]">
              <div className="line-clamp-2 text-[56px] leading-[0.95] font-black uppercase">{title}</div>
              <div className="mt-1 line-clamp-1 text-[38px] tracking-wide uppercase">{address}</div>
              <div className="mt-3 h-px w-full bg-black/40" />
              <div className="mt-3 text-[58px] leading-none font-black">{priceText}</div>
              <div className="mt-2 text-[24px] font-semibold uppercase">
                {(beds !== null && !Number.isNaN(beds) ? beds : "—") + " BED"} |{" "}
                {(baths !== null && !Number.isNaN(baths) ? baths : "—") + " BATH"} |{" "}
                {(size !== null && !Number.isNaN(size) ? `${size} SQM` : "SIZE N/A")}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-[36px] font-semibold text-[#1c1f26] uppercase">
            <span>Property Overview</span>
            <div className="h-px flex-1 bg-[#1c1f26]" />
          </div>

          <div className="mt-2 grid h-[155px] grid-cols-3 gap-2">
            {[t1, t2, t3].map((src, idx) => (
              <div key={idx} className="overflow-hidden bg-[#ececec]">
                {src ? (
                  <img src={src} alt={`Property detail ${idx + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#7f7f7f]">Photo</div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-3 line-clamp-4 text-[24px] leading-relaxed text-[#2e3138]">{description}</p>

          <div className="mt-auto grid h-[95px] grid-cols-[1fr_1.5fr] overflow-hidden bg-[#171c24] text-white">
            <div className="flex items-center gap-4 px-4">
              {agentPhoto ? (
                <img src={agentPhoto} alt="Agent profile" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xs">Agent</div>
              )}
              <div className="min-w-0">
                <div className="truncate text-[28px] font-semibold">{agentName}</div>
                <div className="text-[16px] text-white/70 uppercase">Residential Specialist</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 px-5 text-[20px]">
              {phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon />
                  <span>{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <MailIcon />
                  <span className="max-w-[320px] truncate">{email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
