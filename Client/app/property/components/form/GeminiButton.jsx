export default function GeminiButton({ onClick, disabled, isLoading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Rewrite description with Gemini"
      title="Rewrite description with Gemini"
      className="hover-lift inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--field-border)] bg-[color:var(--field-bg)] text-[color:var(--ink-base)] hover:bg-[color:var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2l1.8 4.7L18.5 8.5l-4.7 1.8L12 15l-1.8-4.7L5.5 8.5l4.7-1.8L12 2z" />
          <path d="M19 14l1 2.4L22.4 17l-2.4.9L19 20.4l-.9-2.5L15.6 17l2.5-.6L19 14z" />
        </svg>
      )}
    </button>
  );
}
