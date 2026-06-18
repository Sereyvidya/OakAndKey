"use client";

function Img({ src, className = "", alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover transition duration-500 ease-out hover:scale-[1.03] ${className}`}
      draggable={false}
    />
  );
}

export default function PhotoGrid({ images = [] }) {
  const count = images.length;

  // 0 images
  if (count === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100">
        <div className="text-sm text-gray-500">
          Upload photos to preview the flyer
        </div>
      </div>
    );
  }

  // 1 image: hero
  if (count === 1) {
    return (
      <div className="h-full w-full animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-2xl">
        <Img src={images[0].preview} alt="Listing photo 1" />
      </div>
    );
  }

  // 2 images: 2-up
  if (count === 2) {
    return (
      <div className="grid h-full w-full grid-cols-2 gap-2 overflow-hidden rounded-2xl">
        <div className="animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-xl">
          <Img src={images[0].preview} alt="Listing photo 1" />
        </div>

        <div className="animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-xl">
          <Img src={images[1].preview} alt="Listing photo 2" />
        </div>
      </div>
    );
  }

  // 3 images: 1 big left, 2 stacked right
  if (count === 3) {
    return (
      <div className="grid h-full w-full grid-cols-3 gap-2 overflow-hidden rounded-2xl">
        <div className="col-span-2 animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-xl">
          <Img src={images[0].preview} alt="Listing photo 1" />
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-2">
          <div className="animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-xl">
            <Img src={images[1].preview} alt="Listing photo 2" />
          </div>
          <div className="animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-xl">
            <Img src={images[2].preview} alt="Listing photo 3" />
          </div>
        </div>
      </div>
    );
  }

  // 4+ images: 2x2, show +N badge if more than 4
  const show = images.slice(0, 4);
  const extra = count - 4;

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
      {show.map((img, i) => {
        const isLast = i === 3 && extra > 0;
        return (
          <div
            key={i}
            className="relative animate-[fadeUp_360ms_ease-out_both] overflow-hidden rounded-xl"
          >
            <Img src={img.preview} alt={`Listing photo ${i + 1}`} />
            {isLast && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="text-2xl font-semibold text-white">
                  +{extra}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
