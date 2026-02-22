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

const PhoneIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.24 1.02l-1.27 1.27a16 16 0 006.59 6.59l1.27-1.27a1 1 0 011.02-.24l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z"
    />
  </svg>
);

export default function FlyerTemplateMinimalistic({ formData, images }) {
  const title = cleanText(formData.propertyTitle) || "NEW LISTING";
  const address = cleanText(formData.address) || "Cambridge";
  const description =
    cleanText(formData.description) ||
    "This bright and spacious home sits in a well-connected neighborhood with practical layout, comfortable bedrooms, and modern kitchen updates.";
  const priceText = cleanText(formData.price)
    ? `$${formatPrice(formData.price)}`
    : "Price On Request";

  const beds = formData.bedrooms !== "" ? Number(formData.bedrooms) : null;
  const baths = formData.bathrooms !== "" ? Number(formData.bathrooms) : null;

  const agentName = cleanText(formData.agentName) || "Trusted Agent";
  const phone = cleanText(formData.agentPhone) || "Add phone";
  const email = cleanText(formData.agentEmail) || "Add email";
  const agentPhoto = src(formData.agentPhoto);

  const list = (images || []).map(src).filter(Boolean);
  const hero = list[0] || "";
  const g1 = list[1] || "";
  const g2 = list[2] || "";
  const g3 = list[3] || "";

  return (
    <div className="absolute inset-0 bg-[#f2f2f2] p-0 text-[#141414]">
      <div className="relative h-full overflow-hidden">
        <div className="absolute top-0 left-0 h-[410px] w-full bg-[#2f377a]" />
        <div className="absolute top-[362px] left-0 h-[150px] w-full -skew-y-[7deg] bg-[#ececec]" />

        <div className="relative px-10 pt-8">
          <div className="text-center text-[76px] leading-none font-black tracking-wide text-white uppercase">
            New Listing
          </div>

          <div className="relative mx-auto mt-4 h-[470px] w-[860px] overflow-hidden border-[10px] border-white bg-[#dedede]">
            {hero ? (
              <img src={hero} alt="Main listing" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#6b7280]">Upload main house photo</div>
            )}

            <div className="absolute bottom-16 left-0 bg-[#f0344a] px-6 py-3 text-[58px] leading-none font-black text-white">
              {priceText}
            </div>
            <div className="absolute bottom-0 left-0 bg-[#5f646b]/95 px-6 py-2 text-[33px] text-white">
              {address}
            </div>
          </div>

          <div className="mx-auto mt-3 grid w-[860px] grid-cols-3 gap-3">
            {[g1, g2, g3].map((img, i) => (
              <div key={i} className="h-[120px] overflow-hidden bg-[#d9d9d9]">
                {img ? (
                  <img src={img} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[#6b7280]">Photo</div>
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-4 grid w-[860px] grid-cols-[1.45fr_1fr] gap-4">
            <div className="text-[26px] leading-relaxed text-[#4a4a4a]">
              <p className="line-clamp-6">{description}</p>
              <p className="mt-3 font-semibold">
                {(beds !== null && !Number.isNaN(beds) ? beds : "—") + " bedrooms"} •{" "}
                {(baths !== null && !Number.isNaN(baths) ? baths : "—") + " bathrooms"}
              </p>
            </div>

            <div className="flex items-start gap-4">
              {agentPhoto ? (
                <img src={agentPhoto} alt="Agent" className="h-40 w-40 rounded-full object-cover" />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-[#d7d7d7] text-sm">Agent</div>
              )}
              <div className="pt-3">
                <div className="text-[22px] text-[#5e5e5e]">Your Professional Trusted Agent</div>
                <div className="mt-1 text-[40px] leading-none font-black text-[#252a3c]">{agentName}</div>
                <div className="mt-2 text-[22px] text-[#4a4a4a]">{email}</div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-5 flex w-[860px] items-center justify-between bg-[#252a3c] px-6 py-4 text-white">
            <div className="text-[18px] tracking-wide uppercase">{title}</div>
            <div className="flex items-center gap-2 text-[40px] font-semibold">
              <PhoneIcon />
              <span>{phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
