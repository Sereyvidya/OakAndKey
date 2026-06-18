"use client";

import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import FlyerTemplateShowcase from "./FlyerTemplateShowcase";
import FlyerTemplateGallery from "./FlyerTemplateGallery";
import FlyerTemplateMinimalistic from "./FlyerTemplateModern";

const CANVAS = {
  width: 1080,
  height: 1350,
};

const PREVIEW_ZOOM = 1;

const FlyerPreview = forwardRef(function FlyerPreview(
  { formData, images, template = "showcase", theme, templateCopy },
  exportRef
) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  const Template = useMemo(() => {
    if (template === "gallery") return FlyerTemplateGallery;
    if (template === "modern") return FlyerTemplateMinimalistic;
    return FlyerTemplateShowcase;
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
            key={`${template}-${theme?.primary}-${theme?.secondary}-${theme?.surface}`}
            ref={exportRef}
            className="flyer-stage-enter h-full w-full overflow-hidden bg-white shadow-[0_40px_80px_rgba(20,26,36,0.18)]"
          >
            <div className="relative h-full w-full">
              <Template
                formData={formData}
                images={images}
                theme={theme}
                templateCopy={templateCopy}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default FlyerPreview;
