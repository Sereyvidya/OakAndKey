export default function InputWithIcon({ icon: Icon, inputProps, hasError }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-muted)]">
        <Icon size={16} />
      </span>

      <input
        {...inputProps}
        className={[
          "form-input-focus form-field h-10 w-full rounded-md border py-2 pr-4 pl-10",
          hasError ? "field-error" : "border-[color:var(--field-border)]",
        ].join(" ")}
      />
    </div>
  );
}
