"use client";

function Img({ src, className = "", alt }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      draggable={false}
    />
  );
}

export default function PhotoGrid({ images = [] }) {
  const count = images.length;

  // 0 images
  if (count === 0) {
    return (
      <div className="w-full h-full rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Upload photos to preview the flyer</div>
      </div>
    );
  }

  // 1 image: hero
  if (count === 1) {
    return (
      <div className="w-full h-full overflow-hidden rounded-2xl">
        <Img src={images[0].preview} alt="Listing photo 1" />
      </div>
    );
  }

  // 2 images: 2-up
  if (count === 2) {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
        <div className="overflow-hidden rounded-xl">
          <Img src={images[0].preview} alt="Listing photo 1" />
        </div>
        <div className="overflow-hidden rounded-xl">
          <Img src={images[1].preview} alt="Listing photo 2" />
        </div>
      </div>
    );
  }

  // 3 images: 1 big left, 2 stacked right
  if (count === 3) {
    return (
      <div className="w-full h-full grid grid-cols-3 gap-2 overflow-hidden rounded-2xl">
        <div className="col-span-2 overflow-hidden rounded-xl">
          <Img src={images[0].preview} alt="Listing photo 1" />
        </div>
        <div className="col-span-1 grid grid-rows-2 gap-2">
          <div className="overflow-hidden rounded-xl">
            <Img src={images[1].preview} alt="Listing photo 2" />
          </div>
          <div className="overflow-hidden rounded-xl">
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
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
      {show.map((img, i) => {
        const isLast = i === 3 && extra > 0;
        return (
          <div key={i} className="relative overflow-hidden rounded-xl">
            <Img src={img.preview} alt={`Listing photo ${i + 1}`} />
            {isLast && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-white font-semibold text-2xl">+{extra}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
