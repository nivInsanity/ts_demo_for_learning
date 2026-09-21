/**
 * Module 01 - Types and inference
 *
 * Read src/m01-types-and-inference/README.md first.
 * Replace every `TODO` and delete the `throw new Error('not implemented')`
 * lines as you go. Run `npm run test:watch` in a second terminal.
 */

import type { Expect, Equal } from '../_lib/type-assert';

/* ------------------------------------------------------------------ *
 * Task 1.1 - write a function
 *
 * Turn a human test title into a slug that is safe to use as a file name,
 * an allure label or a CI artifact path.
 *
 *   "Login  works!"          -> "login-works"
 *   "  User can't log in  "  -> "user-can-t-log-in"
 *   "API / v2 / health"      -> "api-v2-health"
 *   "!!!"                    -> ""
 *
 * Rules:
 *  - lowercase
 *  - every run of characters that is not a-z or 0-9 becomes a single "-"
 *  - no leading or trailing "-"
 * ------------------------------------------------------------------ */
export function sanitizeTestName(raw: string): string {
  throw new Error('not implemented: sanitizeTestName');
}

/* ------------------------------------------------------------------ *
 * Task 1.2 - find the bug
 *
 * This one compiles. It is still wrong.
 *
 * It should parse a duration written the way test reports write them and
 * return the value in milliseconds:
 *
 *   "1500ms" -> 1500
 *   "2s"     -> 2000
 *   "1.5s"   -> 1500
 *   "0.25s"  -> 250
 *   "90"     -> 90     (a bare number means milliseconds)
 *
 * Anything it cannot understand should return NaN. Do not change the
 * signature. Do not change the tests. Find what is broken and fix it.
 *
 * Hint: run the test, read the failure, then look very hard at one call.
 * ------------------------------------------------------------------ */
export function parseDurationMs(raw: string): number {
  const trimmed = raw.trim().toLowerCase();

  if (trimmed.endsWith('ms')) {
    return parseInt(trimmed.slice(0, -2), 10);
  }

  if (trimmed.endsWith('s')) {
    return parseInt(trimmed.slice(0, -1), 10) * 1000;
  }

  return parseInt(trimmed, 10);
}

/* ------------------------------------------------------------------ *
 * Task 1.3 - literal union types
 *
 * `Severity` is currently `string`, which means `severityRank("bananas")`
 * type-checks. That is a bug waiting to happen in a bug tracker integration.
 *
 * Replace it with a union of exactly these five literals, ordered worst
 * to least bad: blocker, critical, major, minor, trivial.
 *
 * Then implement `severityRank`: blocker -> 0, critical -> 1, major -> 2,
 * minor -> 3, trivial -> 4. And `isAtLeast(a, b)` -> true when `a` is at
 * least as severe as `b` ("major" is at least "minor").
 * ------------------------------------------------------------------ */
export type Severity = string; // TODO: replace with a literal union

export function severityRank(severity: Severity): number {
  throw new Error('not implemented: severityRank');
}

export function isAtLeast(actual: Severity, threshold: Severity): boolean {
  throw new Error('not implemented: isAtLeast');
}

/* ------------------------------------------------------------------ *
 * Task 1.4 - tuples
 *
 * CI passes configuration as `KEY=value` strings. Parse one line into a
 * two-element tuple. The *type* matters: `[string, string]` tells the
 * caller there are exactly two elements, `string[]` does not.
 *
 *   "BASE_URL=https://staging.example.com"
 *     -> ["BASE_URL", "https://staging.example.com"]
 *
 * Edge cases the tests care about:
 *  - the value may itself contain "=" - only split on the FIRST one
 *  - surrounding whitespace on the key is trimmed, the value is not
 *  - a line with no "=" at all is not configuration: return null
 * ------------------------------------------------------------------ */
export function parseEnvLine(line: string): [string, string] | null {
  throw new Error('not implemented: parseEnvLine');
}

/* ------------------------------------------------------------------ *
 * Task 1.5 - type-level task, graded by `npm run typecheck`
 *
 * `RETRY_POLICY` below is inferred as:
 *   { attempts: number; mode: string; jitter: boolean }
 *
 * We want the compiler to remember the exact values:
 *   { readonly attempts: 3; readonly mode: "exponential"; readonly jitter: true }
 *
 * One keyword. Add it and the assertions at the bottom of this file stop
 * erroring. `npm test` will NOT catch this - types do not exist at runtime.
 * ------------------------------------------------------------------ */
export const RETRY_POLICY = {
  attempts: 3,
  mode: 'exponential',
  jitter: true,
};

// These lines are the grader for 1.5. Do not edit them.
type _RetryMode = (typeof RETRY_POLICY)['mode'];
type _check_1_5_mode = Expect<Equal<_RetryMode, 'exponential'>>;
type _check_1_5_attempts = Expect<Equal<(typeof RETRY_POLICY)['attempts'], 3>>;

// `_check_*` aliases are never used at runtime. This line keeps the linter
// and the "unused" flags quiet without changing behaviour.
export type _M01TypeChecks = [_check_1_5_mode, _check_1_5_attempts];
