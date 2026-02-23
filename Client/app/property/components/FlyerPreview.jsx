"use client";

import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import FlyerTemplateHero from "./FlyerTemplateHero";
import FlyerTemplateGrid from "./FlyerTemplateGrid";
import FlyerTemplateMinimalistic from "./FlyerTemplateMinimalistic";

const CANVAS = {
  width: 1080,
  height: 1350,
};

const PREVIEW_ZOOM = 1;

const FlyerPreview = forwardRef(function FlyerPreview(
  { formData, images, template = "hero" },
  exportRef
) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const Template = useMemo(() => {
    if (template === "grid") return FlyerTemplateGrid;
    if (template === "minimal") return FlyerTemplateMinimalistic;
    return FlyerTemplateHero;
  }, [template]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const containerWidth = entry.contentRect.width;
      const fitScale = Math.min(1, containerWidth / CANVAS.width);
      setScale(fitScale * PREVIEW_ZOOM);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {/* Spacer keeps layout height correct while we scale the fixed canvas */}
      <div
        className="relative"
        style={{
          width: CANVAS.width * scale,
          height: CANVAS.height * scale,
        }}
      >
        {/* Scaled stage (the inside is always 1080×1350) */}
        <div
          className="absolute inset-0"
          style={{
            width: CANVAS.width,
            height: CANVAS.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Export node: fixed size, never fluid */}
          <div
            key={template}
            ref={exportRef}
            className="h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-white"
          >
            <div className="relative h-full w-full">
              <Template formData={formData} images={images} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FlyerPreview;
