import type { FairHousingIssue } from "@/app/lib/fairHousing";

/** Non-blocking heads-up about wording that may conflict with fair housing rules. */
export default function FairHousingNotice({
  issues,
  className = "",
}: {
  issues: FairHousingIssue[];
  className?: string;
}) {
  if (issues.length === 0) return null;

  return (
    <div
      role="note"
      aria-label="Fair housing check"
      className={`rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 ${className}`}
    >
      <div className="font-semibold">
        Fair housing check: review the wording
      </div>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {issues.map((issue) => (
          <li key={issue.term.toLowerCase()}>
            <span className="font-medium">“{issue.term}”</span> (
            {issue.category}): {issue.advice}
          </li>
        ))}
      </ul>
    </div>
  );
}
