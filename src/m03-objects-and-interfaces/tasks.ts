/**
 * Module 03 - Objects, interfaces and structural typing
 *
 * Read src/m03-objects-and-interfaces/README.md first.
 */

export type TestStatus = 'passed' | 'failed' | 'skipped' | 'flaky';

/* ------------------------------------------------------------------ *
 * Task 3.1 - shape a domain object, then render it
 *
 * `TestCase` below is a placeholder. Replace it with an interface that has:
 *
 *   id         string, READONLY - a case id never changes after creation
 *   title      string
 *   status     TestStatus
 *   durationMs number
 *   tags       optional array of strings
 *   owner      optional object with `name` and `email`, both strings
 *
 * Then implement `formatTestCase`:
 *
 *   'TC-1 · Login works · passed · 1.2s'
 *   'TC-1 · Login works · failed · 950ms [smoke, auth]'
 *   'TC-1 · Login works · flaky · 2.0s [smoke] (Ann Kowalska)'
 *
 * Rules:
 *  - the separator between the first four parts is ' · ' (U+00B7)
 *  - duration under 1000ms renders as '950ms'; 1000 and above renders as
 *    seconds with exactly one decimal, '1.2s'
 *  - the tag block is omitted entirely when tags are missing or empty
 *  - the owner block shows the name only, and is omitted when absent
 * ------------------------------------------------------------------ */
export interface TestCase {
  // TODO: replace this placeholder with the real shape
  [key: string]: unknown;
}

export function formatTestCase(testCase: TestCase): string {
  throw new Error('not implemented: formatTestCase');
}

/* ------------------------------------------------------------------ *
 * Task 3.2 - index signatures and Record
 *
 * Count how many cases ended in each status. Every status must be present in
 * the result, even with a count of zero - a reporter that omits 'failed'
 * because there were none is a reporter that hides regressions.
 *
 *   countByStatus([]) -> { passed: 0, failed: 0, skipped: 0, flaky: 0 }
 * ------------------------------------------------------------------ */
export function countByStatus(cases: TestCase[]): Record<TestStatus, number> {
  throw new Error('not implemented: countByStatus');
}

/* ------------------------------------------------------------------ *
 * Task 3.3 - find the bug
 *
 * `cloneConfig` is supposed to hand back an independent copy so a test can
 * tweak headers without poisoning the shared default config for every other
 * test in the run. It does not.
 *
 * Symptom: mutate the clone's `headers` or `tags`, and the original changes
 * too. This is the number one cause of "the test passes alone and fails in
 * the suite".
 *
 * Fix it. Keep the signature.
 * ------------------------------------------------------------------ */
export interface SuiteConfig {
  name: string;
  retries: number;
  headers: Record<string, string>;
  tags: string[];
}

export function cloneConfig(config: SuiteConfig): SuiteConfig {
  return { ...config };
}

/* ------------------------------------------------------------------ *
 * Task 3.4 - optional properties, done by hand
 *
 * `SuiteConfigOverride` should be `SuiteConfig` with every property optional.
 * Write it out by hand - in module 10 you will learn the one-line version
 * and it will mean something, because you did it the long way first.
 *
 * Then implement `mergeConfig`:
 *  - a scalar present in the override replaces the base value
 *  - a scalar absent (or undefined) keeps the base value
 *  - `headers` are merged key by key, override wins on a collision
 *  - `tags` are concatenated, with duplicates removed, base order first
 *  - neither argument may be mutated
 * ------------------------------------------------------------------ */
export interface SuiteConfigOverride {
  // TODO: every property of SuiteConfig, optional
}

export function mergeConfig(base: SuiteConfig, override: SuiteConfigOverride): SuiteConfig {
  throw new Error('not implemented: mergeConfig');
}

/* ------------------------------------------------------------------ *
 * Task 3.5 - structural typing and excess property checks
 *
 * `ReporterOptions` is currently a bag of anything, so a typo in a caller's
 * object literal goes straight to production.
 *
 * Replace it with an interface:
 *   outputDir  string
 *   open       optional, one of 'always' | 'never' | 'on-failure'
 *
 * Then implement `createReporter` so it returns `${outputDir}:${open}`,
 * defaulting `open` to 'never'.
 *
 * Once the interface is in place, TypeScript's *excess property check* kicks
 * in for object literals passed directly to the function - see the tests.
 * ------------------------------------------------------------------ */
export type ReporterOptions = Record<string, unknown>; // TODO: make this an interface

export function createReporter(options: ReporterOptions): string {
  throw new Error('not implemented: createReporter');
}
