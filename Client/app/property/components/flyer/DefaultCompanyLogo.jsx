export default function DefaultCompanyLogo({
  primary = "#191d24",
  secondary = "#beb491",
  className = "",
}) {
  return (
    <svg
      viewBox="0 0 260 180"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Default company logo"
    >
      <rect x="79" y="62" width="55" height="88" rx="3" fill={secondary} />

      <path
        d="
          M36 147
          H60

          V110

          L149 68
          V32

          M149 32
          H108

          V136
          H190

          V102
          L149 76

          V147
          H228
        "
        fill="none"
        stroke={primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
