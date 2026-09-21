/** Module 06 - reference solution. */

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

export interface TestResult {
  name: string;
  status: TestStatus;
  durationMs: number;
}

/* --- 6.1 ---------------------------------------------------------- */
export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];

  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export function partition<T>(items: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matching: T[] = [];
  const rest: T[] = [];

  for (const item of items) {
    (predicate(item) ? matching : rest).push(item);
  }

  // The explicit tuple annotation on the return type is what stops this being
  // inferred as `T[][]`, which would let callers index [2] without complaint.
  return [matching, rest];
}

/* --- 6.2 ---------------------------------------------------------- */
export type Selector<T> = (item: T) => string | number;

export function sortBy<T>(items: T[], selectors: Selector<T>[]): T[] {
  // `[...items]` first. `sort` sorts in place and returns the same array,
  // so sorting a caller's array is a side effect they did not ask for.
  return [...items].sort((a, b) => {
    for (const select of selectors) {
      const left = select(a);
      const right = select(b);
      if (left < right) return -1;
      if (left > right) return 1;
    }
    // Equal on every key: return 0 and let sort's stability (guaranteed
    // since ES2019) preserve the original order.
    return 0;
  });
}

/* --- 6.3 ---------------------------------------------------------- *
 * Bug one: `results.sort(...)` sorts IN PLACE and returns the same array.
 * The caller's array comes back reordered. In a test suite that means the
 * reporter quietly changes the execution order data everyone else reads.
 * Copy first: `[...results].sort(...)`.
 *
 * Bug two: `.sort()` with no comparator converts every element to a string
 * and sorts lexicographically. So [1, 2, 10] becomes [1, 10, 2], and
 * [1, 3, 10, 200] becomes [1, 10, 200, 3]. Numbers always need
 * `.sort((a, b) => a - b)`. This one has shipped to production more times
 * than anyone would like to admit, because it is correct for single-digit
 * test data.
 */
export function slowestTests(results: TestResult[], count: number): TestResult[] {
  return [...results].sort((a, b) => b.durationMs - a.durationMs).slice(0, count);
}

export function medianDuration(results: TestResult[]): number {
  if (results.length === 0) return 0;

  const sorted = results.map((result) => result.durationMs).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1]! + sorted[middle]!) / 2
    : sorted[middle]!;
}

/* --- 6.4 ---------------------------------------------------------- */
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
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let flaky = 0;
  let totalDurationMs = 0;
  let slowest: TestResult | null = null;

  for (const result of results) {
    switch (result.status) {
      case 'passed':
        passed += 1;
        break;
      case 'failed':
        failed += 1;
        break;
      case 'skipped':
        skipped += 1;
        break;
      case 'flaky':
        flaky += 1;
        break;
    }

    totalDurationMs += result.durationMs;

    // Strictly greater-than is what makes ties resolve to the first one seen.
    if (slowest === null || result.durationMs > slowest.durationMs) {
      slowest = result;
    }
  }

  const rated = results.length - skipped;
  const passRate = rated === 0 ? 0 : Math.round((passed / rated) * 100) / 100;

  return {
    total: results.length,
    passed,
    failed,
    skipped,
    flaky,
    passRate,
    totalDurationMs,
    slowest: slowest === null ? null : slowest.name,
  };
}

/*
 * A `reduce` version is equally valid and about as long:
 *
 *   results.reduce<RunSummary>((acc, r) => ({ ...acc, ... }), initial)
 *
 * Spreading the accumulator on every element allocates a new object per test,
 * which on a large run is measurable. A plain loop is not less functional,
 * it is just honest about what it does.
 */

/* --- 6.5 ---------------------------------------------------------- */
export interface SuiteDiff {
  added: string[];
  removed: string[];
  common: string[];
}

export function diffSuites(before: string[], after: string[]): SuiteDiff {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);

  // `new Set(list)` also deduplicates while preserving first-seen order,
  // which covers the "repeated names" requirement for free.
  return {
    added: [...afterSet].filter((name) => !beforeSet.has(name)),
    removed: [...beforeSet].filter((name) => !afterSet.has(name)),
    common: [...beforeSet].filter((name) => afterSet.has(name)),
  };
}
