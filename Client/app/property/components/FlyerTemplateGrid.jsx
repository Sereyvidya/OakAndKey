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

function src(img) {
  return img?.preview || img?.src || img?.url || "";
}

export default function FlyerTemplateGrid({ formData, images }) {
  const title = cleanText(formData.propertyTitle) || "Mountain Vista Home";
  const address = cleanText(formData.address) || "Seattle, WA";
  const description =
    cleanText(formData.description) ||
    "Thoughtfully renovated home blending elegant design with practical daily living. Bright kitchen, open entertaining zones, and quality finishes throughout.";
  const priceText = cleanText(formData.price)
    ? `$${formatPrice(formData.price)}`
    : "Contact for price";

  const beds = formData.bedrooms !== "" ? Number(formData.bedrooms) : null;
  const baths = formData.bathrooms !== "" ? Number(formData.bathrooms) : null;
  const size = formData.size !== "" ? Number(formData.size) : null;

  const agentName = cleanText(formData.agentName) || "Listing Agent";
  const phone = cleanText(formData.agentPhone) || "Phone not provided";
  const email = cleanText(formData.agentEmail) || "Email not provided";
  const agentPhoto = src(formData.agentPhoto);

  const gallery = (images || []).map(src).filter(Boolean);

  const hero = gallery[0] || "";
  const r1 = gallery[1] || "";
  const r2 = gallery[2] || "";
  const b1 = gallery[3] || "";
  const b2 = gallery[4] || "";
  const b3 = gallery[5] || "";

  return (
    <div className="absolute inset-0 bg-[#eef2f6] p-5 text-[#111827]">
      <div className="h-full bg-white p-4">
        <div className="flex items-end justify-between bg-[#2f5f8a] px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="line-clamp-1 text-[48px] font-bold">{title}</div>
            <div className="line-clamp-1 text-[28px] text-white/85">{address}</div>
          </div>
          <div className="text-[56px] leading-none font-black">{priceText}</div>
        </div>

        <div className="mt-4 grid h-[470px] grid-cols-[2fr_1fr] gap-3">
          <div className="overflow-hidden bg-[#e5e7eb]">
            {hero ? (
              <img src={hero} alt="Main listing" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-[#6b7280]">Upload hero image</div>
            )}
          </div>
          <div className="grid grid-rows-2 gap-3">
            {[r1, r2].map((img, i) => (
              <div key={i} className="overflow-hidden bg-[#e5e7eb]">
                {img ? (
                  <img src={img} alt={`Right gallery ${i + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#6b7280]">Photo</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid h-[120px] grid-cols-3 gap-3">
          {[b1, b2, b3].map((img, i) => (
            <div key={i} className="overflow-hidden bg-[#e5e7eb]">
              {img ? (
                <img src={img} alt={`Bottom gallery ${i + 1}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#6b7280]">Photo</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1.8fr_1fr] gap-4">
          <div className="text-[24px] leading-relaxed text-[#1f2937]">
            <p className="line-clamp-8">{description}</p>
            <p className="mt-3 font-semibold">
              {(beds !== null && !Number.isNaN(beds) ? beds : "—") + " beds"} •{" "}
              {(baths !== null && !Number.isNaN(baths) ? baths : "—") + " baths"} •{" "}
              {(size !== null && !Number.isNaN(size) ? `${size} sqm` : "size pending")}
            </p>
          </div>

          <div className="bg-[#d6dde6] p-4">
            <div className="flex items-start gap-3">
              {agentPhoto ? (
                <img src={agentPhoto} alt="Agent" className="h-20 w-20 rounded object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center bg-white text-xs">Agent</div>
              )}
              <div>
                <div className="text-xs tracking-[0.14em] text-[#4b5563] uppercase">Listing Agent</div>
                <div className="text-[30px] leading-none font-black">{agentName}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-[20px] text-[#1f2937]">
              <div>{phone}</div>
              <div className="truncate">{email}</div>
            </div>
            <div className="mt-4 text-xs tracking-wide text-[#4b5563] uppercase">AngkorListing Realty</div>
          </div>
        </div>
      </div>
    </div>
  );
}
