/** Module 03 - reference solution. */

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

/* --- 3.1 ---------------------------------------------------------- */
export interface TestCase {
  readonly id: string;
  title: string;
  status: TestStatus;
  durationMs: number;
  tags?: string[];
  owner?: { name: string; email: string };
}

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function formatTestCase(testCase: TestCase): string {
  const head = [
    testCase.id,
    testCase.title,
    testCase.status,
    formatDuration(testCase.durationMs),
  ].join(' · ');

  // Building an array of optional fragments and joining once is far easier to
  // read - and to extend - than a chain of string concatenations guarded by
  // ifs. It is also trivially testable: each fragment is independent.
  const extras: string[] = [];
  if (testCase.tags !== undefined && testCase.tags.length > 0) {
    extras.push(`[${testCase.tags.join(', ')}]`);
  }
  if (testCase.owner !== undefined) {
    extras.push(`(${testCase.owner.name})`);
  }

  return [head, ...extras].join(' ');
}

/* --- 3.2 ---------------------------------------------------------- */
export function countByStatus(cases: TestCase[]): Record<TestStatus, number> {
  // Seeding every key up front is what guarantees `failed: 0` shows up.
  // The annotation also means adding a fifth status to `TestStatus` turns
  // this line into a compile error instead of a silently missing column.
  const counts: Record<TestStatus, number> = { passed: 0, failed: 0, skipped: 0, flaky: 0 };

  for (const testCase of cases) {
    counts[testCase.status] += 1;
  }

  return counts;
}

/* --- 3.3 ---------------------------------------------------------- *
 * The bug was that spread is a SHALLOW copy.
 *
 * `{ ...config }` makes a new outer object whose `headers` property points at
 * the very same object the original points at. Copy every mutable level you
 * care about. For deeply nested data, `structuredClone(config)` does the
 * whole tree in one call (Node 17+) - but it is slower and it chokes on
 * functions, so be deliberate.
 */
export interface SuiteConfig {
  name: string;
  retries: number;
  headers: Record<string, string>;
  tags: string[];
}

export function cloneConfig(config: SuiteConfig): SuiteConfig {
  return {
    ...config,
    headers: { ...config.headers },
    tags: [...config.tags],
  };
}

/* --- 3.4 ---------------------------------------------------------- */
export interface SuiteConfigOverride {
  name?: string;
  retries?: number;
  headers?: Record<string, string>;
  tags?: string[];
}

export function mergeConfig(base: SuiteConfig, override: SuiteConfigOverride): SuiteConfig {
  return {
    name: override.name ?? base.name,
    retries: override.retries ?? base.retries,
    headers: { ...base.headers, ...override.headers },
    // `new Set` preserves first-seen insertion order, which is exactly the
    // "base order first, duplicates dropped" rule.
    tags: [...new Set([...base.tags, ...(override.tags ?? [])])],
  };
}

/* --- 3.5 ---------------------------------------------------------- */
export interface ReporterOptions {
  outputDir: string;
  open?: 'always' | 'never' | 'on-failure';
}

export function createReporter(options: ReporterOptions): string {
  return `${options.outputDir}:${options.open ?? 'never'}`;
}
