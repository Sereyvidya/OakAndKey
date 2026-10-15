import Link from "next/link";
import { ArrowRight } from "lucide-react";

const templateCards = [
  {
    name: "Showcase",
    src: "/template-showcase.png",
    className: "left-0 top-4 rotate-[-5deg]",
  },
  {
    name: "Gallery",
    src: "/template-gallery.png",
    className: "right-0 top-16 rotate-[4deg]",
  },
  {
    name: "Modern",
    src: "/template-modern.png",
    className: "bottom-0 left-1/2 -translate-x-1/2 rotate-[-1deg]",
  },
];

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)] overflow-hidden">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-8 py-10 md:grid-cols-[4fr_6fr] md:gap-12 md:py-16">
        <div className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left">
          <h1 className="leading-[0.92] font-semibold tracking-tight text-[var(--ink-strong)]">
            <span className="hero-title-drop block text-[clamp(2.75rem,7vw,4.5rem)] whitespace-nowrap">
              Less formatting.
            </span>
            <span className="hero-title-drop hero-title-drop-delay block text-[clamp(2.75rem,7vw,4.5rem)] whitespace-nowrap">
              More selling.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--ink-soft)] md:text-lg md:leading-8">
            One listing. Everything you need to market it.
          </p>

          <div className="relative mt-8 w-full max-w-md">
            <svg
              className="pointer-events-none absolute top-[14px] left-[-3px] h-[188px] w-[34px]"
              viewBox="0 0 34 188"
              fill="none"
              aria-hidden="true"
            >
              <path
                className="workflow-path"
                d="M17 14
      C43 65, -9 45, 17 94
      C43 145, -9 125, 17 174"
                stroke="var(--card-border)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            <div className="space-y-10">
              {[
                [
                  "1",
                  "Add listing details",
                  "Address, price, beds, baths, photos.",
                ],
                [
                  "2",
                  "Choose a flyer style",
                  "Pick a polished template that fits the home.",
                ],
                [
                  "3",
                  "Generate captions",
                  "Create ready-to-post marketing copy instantly.",
                ],
              ].map(([step, title, body]) => (
                <div
                  key={step}
                  className="relative grid grid-cols-[28px_1fr] gap-4 text-left"
                >
                  <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-[#0b0f14]">
                    {step}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-[var(--ink-strong)]">
                      {title}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[var(--ink-soft)]">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/property/general"
            className="shine-button hover-lift mt-8 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-[#0b0f14] hover:bg-[var(--brand-strong)]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative order-1 min-h-[380px] md:order-2 md:min-h-[clamp(520px,54vw,620px)]">
          {templateCards.map((card) => (
            <div
              key={card.name}
              className={[
                "flyer-slide-in absolute w-[clamp(220px,26vw,320px)]",
                card.className,
              ].join(" ")}
            >
              <div className="transition-transform duration-300 hover:z-20 hover:scale-[1.03]">
                <img
                  src={card.src}
                  alt={`${card.name} flyer template`}
                  className="w-full drop-shadow-[0_35px_60px_rgba(20,26,36,0.18)]"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
