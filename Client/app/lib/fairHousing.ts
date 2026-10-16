/**
 * Heuristic fair-housing wording check for listing copy.
 *
 * The US Fair Housing Act bars advertising that states a preference or
 * limitation based on race, color, religion, sex, disability, familial
 * status or national origin. Good listing copy describes the property, not
 * the people who should live there. This is a phrase-based *warning*, not
 * legal advice: it catches common problem wording and never blocks anything.
 * English only.
 */

export type FairHousingCategory =
  | "familial status"
  | "religion"
  | "race / national origin"
  | "disability"
  | "neighborhood steering";

export interface FairHousingIssue {
  /** The text that matched, as written. */
  term: string;
  category: FairHousingCategory;
  /** Short suggestion shown to the user. */
  advice: string;
}

interface Rule {
  pattern: RegExp;
  category: FairHousingCategory;
  advice: string;
}

const AUDIENCE =
  "(?:famil(?:y|ies)|couples?|singles?|bachelors?|young professionals?|professionals?|newlyweds?|empty[- ]nesters?|retirees?|seniors?|kids?|children|students?)";

const RULES: Rule[] = [
  {
    pattern: new RegExp(
      `\\b(?:perfect|ideal|great|best|designed|suited|made|right)(?:\\s+(?:place|home|house|choice|fit|spot|option|setting|location))?\\s+(?:for|with|to suit)\\s+(?:a\\s+|the\\s+|young\\s+|growing\\s+|small\\s+|large\\s+|big\\s+)*${AUDIENCE}\\b`,
      "gi"
    ),
    category: "familial status",
    advice:
      "Describes who should live here. Describe the space instead (e.g. “four bedrooms and a fenced yard”).",
  },
  {
    pattern:
      /\b(?:adults?[- ]only|no (?:children|kids)|(?:singles?|couples?)[- ]only|bachelor(?:'s)? pad|empty[- ]nesters?)\b/gi,
    category: "familial status",
    advice: "States a preference about household type. Remove it.",
  },
  {
    pattern:
      /\b(?:walking distance (?:to|of|from) (?:a |the )?(?:church|synagogue|mosque|temple)|near (?:a |the )?(?:church|synagogue|mosque)|(?:christian|catholic|jewish|muslim|mormon|hindu|buddhist) (?:community|neighborhood|area|family|families|owners?|tenants?))\b/gi,
    category: "religion",
    advice:
      "References religion. Name neighborhood amenities neutrally (parks, schools, transit).",
  },
  {
    pattern:
      /\b(?:(?:white|black|hispanic|latino|asian|ethnic|minority|immigrant|foreign|american|english[- ]speaking)[- ](?:only )?(?:neighborhood|area|community|families|tenants|buyers)|english[- ]speaking only|no (?:minorities|immigrants|foreigners)|integrated (?:neighborhood|community)|diverse (?:neighborhood|community))\b/gi,
    category: "race / national origin",
    advice: "References race, ethnicity or national origin. Remove it.",
  },
  {
    pattern:
      /\b(?:able[- ]bodied|no (?:disabled|handicapped|wheelchairs?)|handicapped|healthy (?:tenants?|buyers?|owners?)|physically fit)\b/gi,
    category: "disability",
    advice:
      "May exclude people with disabilities. Describe accessibility features factually (e.g. “step-free entry”).",
  },
  {
    pattern:
      /\b(?:exclusive|prestigious|upscale|elite|high[- ]class|desirable)\s+(?:neighborhood|area|community|location|address)\b|\b(?:safe|secure|crime[- ]free|low[- ]crime|quiet)\s+(?:neighborhood|area|community)\b/gi,
    category: "neighborhood steering",
    advice:
      "Subjective neighborhood claims can steer buyers. Prefer verifiable facts (distance to a named park, school or station).",
  },
];

/** Finds fair-housing wording issues in `text`; empty when none. */
export function findFairHousingIssues(text: string): FairHousingIssue[] {
  const issues: FairHousingIssue[] = [];
  const seen = new Set<string>();
  for (const rule of RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      const term = match[0].trim();
      const key = term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      issues.push({ term, category: rule.category, advice: rule.advice });
    }
  }
  return issues;
}

/** Prompt rules appended to every generation request. */
export const FAIR_HOUSING_PROMPT_RULES = `Fair housing rules (US Fair Housing Act):
- Describe the property and its features, never the people who should live there.
- Do not mention or hint at race, color, religion, sex, disability, familial status or national origin.
- Avoid phrases like "perfect for families", "ideal for young professionals", "exclusive neighborhood", "safe neighborhood", or references to churches or other religious institutions.
- Keep neighborhood mentions factual and verifiable (named parks, schools, transit, commute times) and only if they appear in the listing details.`;

/** Feedback appended to the retry prompt when the first reply was flagged. */
export function fairHousingFeedback(terms: string[]): string {
  return `Your previous reply used wording that can violate fair housing rules: ${terms
    .map((t) => `"${t}"`)
    .join(
      ", "
    )}. Rewrite without these or similar phrases, describing only the property.`;
}
