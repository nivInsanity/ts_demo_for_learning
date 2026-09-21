/**
 * Module 06 - Arrays, Maps and Sets
 *
 * Read src/m06-collections/README.md first.
 *
 * Most of a QA engineer's TypeScript is reshaping data: turning a raw run
 * report into the three numbers someone actually wants in Slack. This module
 * is that, with two of the most expensive array bugs in the language.
 */

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

export interface TestResult {
  name: string;
  status: TestStatus;
  durationMs: number;
}

/* ------------------------------------------------------------------ *
 * Task 6.1 - uniqueBy and partition
 *
 *   uniqueBy(results, r => r.name)  -> first occurrence of each name wins
 *   partition(results, r => r.status === 'failed')
 *     -> [failures, everythingElse]   (a TUPLE, not an object)
 *
 * Neither may mutate its input.
 * ------------------------------------------------------------------ */
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  throw new Error('not implemented: uniqueBy');
}

export function partition<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  throw new Error('not implemented: partition');
}

/* ------------------------------------------------------------------ *
 * Task 6.2 - sortBy with multiple keys
 *
 * Sort by the first selector; break ties with the second; and so on.
 * Ascending only. Strings compare by code point, numbers numerically.
 *
 *   sortBy(results, [r => r.status, r => r.durationMs])
 *
 * Requirements:
 *  - does NOT mutate the input array
 *  - is stable: items that compare equal keep their original order
 *  - an empty selector list returns a copy in the original order
 * ------------------------------------------------------------------ */
export type Selector<T> = (item: T) => string | number;

export function sortBy<T>(items: T[], selectors: Selector<T>[]): T[] {
  throw new Error('not implemented: sortBy');
}

/* ------------------------------------------------------------------ *
 * Task 6.3 - find the bugs (there are two, in two functions)
 *
 * Both compile. Both are the classic version of their mistake.
 *
 * `slowestTests` should return the N slowest results, slowest first, and
 * leave the caller's array exactly as it found it.
 *
 * `medianDuration` should return the median duration. It is correct for
 * some inputs and wrong for others, which is the worst possible failure mode
 * because it looks fine in the demo.
 * ------------------------------------------------------------------ */
export function slowestTests(results: TestResult[], count: number): TestResult[] {
  return results.sort((a, b) => b.durationMs - a.durationMs).slice(0, count);
}

export function medianDuration(results: TestResult[]): number {
  if (results.length === 0) return 0;

  const sorted = results.map((result) => result.durationMs).sort();
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

/* ------------------------------------------------------------------ *
 * Task 6.4 - reduce, and one honest metric
 *
 * Build the summary a reporter would post.
 *
 *  - `passRate` is passed / (total - skipped), rounded to 2 decimals.
 *    Skipped tests are excluded from the denominator: a suite where you
 *    skipped everything is not a 0% pass rate, it is no data. When the
 *    denominator is 0, `passRate` is 0.
 *  - `flaky` counts toward `total` but is not `passed`.
 *  - `slowest` is the name of the slowest result; ties go to the first one;
 *    an empty input gives null.
 * ------------------------------------------------------------------ */
export interface RunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  passRate: number;
  totalDurationMs: number;
  slowest: string | null;
}

export function summarize(results: TestResult[]): RunSummary {
  throw new Error('not implemented: summarize');
}

/* ------------------------------------------------------------------ *
 * Task 6.5 - Set and Map
 *
 * Compare two runs by test name.
 *
 *   added   - in `after`, not in `before`, in `after` order
 *   removed - in `before`, not in `after`, in `before` order
 *   common  - in both, in `before` order
 *
 * Do it with Sets. The nested-loop version is O(n*m) and is genuinely slow on
 * a 20k-test suite; the Set version is O(n+m) and is shorter.
 * ------------------------------------------------------------------ */
export interface SuiteDiff {
  added: string[];
  removed: string[];
  common: string[];
}

export function diffSuites(before: string[], after: string[]): SuiteDiff {
  throw new Error('not implemented: diffSuites');
}
