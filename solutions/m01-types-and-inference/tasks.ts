/**
 * Module 01 - reference solution.
 *
 * Read this AFTER your own version is green. There is usually more than one
 * correct answer; the commentary explains why this one was chosen.
 */

import type { Expect, Equal } from '../../src/_lib/type-assert';

/* --- 1.1 ---------------------------------------------------------- */
export function sanitizeTestName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // any run of "not a slug character" -> one dash
    .replace(/^-+|-+$/g, ''); // then drop the dashes at the edges
}

/* --- 1.2 ---------------------------------------------------------- *
 * The bug was `parseInt`.
 *
 * `parseInt('1.5', 10)` returns 1: it stops at the first character that is
 * not part of an integer. Nobody notices until a test takes 1.5 seconds.
 *
 * `Number()` parses the whole string and returns NaN if any of it is junk,
 * which is exactly the contract we want. Its one trap is that `Number('')`
 * is 0, so empty input is rejected explicitly.
 */
export function parseDurationMs(raw: string): number {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === '') return NaN;

  const toNumber = (value: string): number => (value.trim() === '' ? NaN : Number(value));

  if (trimmed.endsWith('ms')) {
    return toNumber(trimmed.slice(0, -2));
  }

  if (trimmed.endsWith('s')) {
    return toNumber(trimmed.slice(0, -1)) * 1000;
  }

  return toNumber(trimmed);
}

/* --- 1.3 ---------------------------------------------------------- */
export type Severity = 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';

// `as const` keeps the literal types, so `indexOf` below stays type safe and
// the array doubles as the single source of truth for the ordering.
const SEVERITY_ORDER = ['blocker', 'critical', 'major', 'minor', 'trivial'] as const;

export function severityRank(severity: Severity): number {
  return SEVERITY_ORDER.indexOf(severity);
}

export function isAtLeast(actual: Severity, threshold: Severity): boolean {
  // Lower rank means more severe, so "at least as bad" is "<=".
  return severityRank(actual) <= severityRank(threshold);
}

/* --- 1.4 ---------------------------------------------------------- */
export function parseEnvLine(line: string): [string, string] | null {
  const index = line.indexOf('=');
  if (index === -1) return null;

  const key = line.slice(0, index).trim();
  const value = line.slice(index + 1);

  // Note the explicit tuple type on the return: `[key, value]` would be
  // inferred as `string[]` in some positions, which loses the "exactly two"
  // guarantee the caller relies on.
  return [key, value];
}

/* --- 1.5 ---------------------------------------------------------- *
 * `as const` does three things at once: every property becomes readonly,
 * every value keeps its literal type, and arrays become readonly tuples.
 */
export const RETRY_POLICY = {
  attempts: 3,
  mode: 'exponential',
  jitter: true,
} as const;

type _RetryMode = (typeof RETRY_POLICY)['mode'];
type _check_1_5_mode = Expect<Equal<_RetryMode, 'exponential'>>;
type _check_1_5_attempts = Expect<Equal<(typeof RETRY_POLICY)['attempts'], 3>>;

export type _M01TypeChecks = [_check_1_5_mode, _check_1_5_attempts];
