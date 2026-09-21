/**
 * Module 11 - `unknown`, assertions, `satisfies`, and lying to the compiler
 *
 * Read src/m11-type-safety/README.md first.
 *
 * Everything so far assumed the data matched the types. This module is about
 * the boundary where that assumption is false: JSON from an API, a config
 * file, a fixture someone edited by hand. That boundary is where QA lives.
 */

import type { Expect, Equal } from '../_lib/type-assert';

/* ------------------------------------------------------------------ *
 * Task 11.1 - `unknown` is the honest type for foreign data
 *
 *   parseJson(raw)  -> the parsed value as `unknown`, or null if `raw`
 *                      is not valid JSON. It must never throw.
 *   asRecord(value) -> the value as Record<string, unknown> when it is a
 *                      plain object (not null, not an array), else null
 *   getString(v, k) -> the string at key k, or null when it is missing or
 *                      is not a string
 *
 * Note what `getString` does NOT do: it does not throw, and it does not
 * return `any`. Every caller is forced to handle the null.
 * ------------------------------------------------------------------ */
export function parseJson(raw: string): unknown {
  throw new Error('not implemented: parseJson');
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  throw new Error('not implemented: asRecord');
}

export function getString(value: unknown, key: string): string | null {
  throw new Error('not implemented: getString');
}

/* ------------------------------------------------------------------ *
 * Task 11.2 - find the bug
 *
 * `readConfig` compiles, has no `any` in sight, and returns a value the type
 * checker believes is an `AppConfig`. Feed it `'{}'` and you get an object
 * whose `baseUrl` is undefined, typed as `string`. Two hundred lines later
 * something calls `.startsWith` on it and you debug the wrong file.
 *
 * The bug is the `as`. A type assertion is not a conversion and not a check -
 * it is you telling the compiler to stop asking questions.
 *
 * Fix it: validate at the boundary and throw `Error` with the message
 * `invalid config: <field>` for the FIRST field that is missing or the
 * wrong type, checking in declaration order (baseUrl, retries, headless).
 * Invalid JSON throws `invalid config: not JSON`.
 * ------------------------------------------------------------------ */
export interface AppConfig {
  baseUrl: string;
  retries: number;
  headless: boolean;
}

export function readConfig(raw: string): AppConfig {
  return JSON.parse(raw) as AppConfig;
}

/* ------------------------------------------------------------------ *
 * Task 11.3 - `satisfies`
 *
 * The annotation below checks the values - good - but destroys the keys:
 * `keyof typeof ENVIRONMENTS` is `string`, so `ENVIRONMENTS.stagign` compiles
 * and `EnvName` is useless.
 *
 * Replace the annotation with `satisfies Record<string, EnvConfig>`, which
 * checks the value against the type WITHOUT widening what TypeScript
 * inferred. You get both: validated values and literal keys.
 *
 * Then implement `configFor`.
 * ------------------------------------------------------------------ */
export interface EnvConfig {
  baseUrl: string;
  retries: number;
}

export const ENVIRONMENTS: Record<string, EnvConfig> = {
  local: { baseUrl: 'http://localhost:3000', retries: 0 },
  staging: { baseUrl: 'https://staging.example.com', retries: 2 },
  prod: { baseUrl: 'https://example.com', retries: 3 },
};

export type EnvName = keyof typeof ENVIRONMENTS;

export function configFor(env: EnvName): EnvConfig {
  throw new Error('not implemented: configFor');
}

type _check_11_3 = Expect<Equal<EnvName, 'local' | 'staging' | 'prod'>>;

/* ------------------------------------------------------------------ *
 * Task 11.4 - optional chaining, nullish coalescing, and the `!` you
 *             should not write
 *
 * `ownerEmail` digs through a structure where every level is optional and
 * returns the first email it finds, falling back to
 * 'unassigned@example.com'.
 *
 * Order: `owner.email`, then `owner.team.lead.email`, then the fallback.
 *
 * Do it without a single `!` and without a single `as`. `?.` and `??` are
 * enough. An empty string counts as a real value, not a missing one -
 * which is exactly why `??` and not `||`.
 * ------------------------------------------------------------------ */
export interface RunReport {
  suite: string;
  owner?: {
    email?: string;
    team?: {
      lead?: { email?: string };
    };
  };
}

export function ownerEmail(report: RunReport): string {
  throw new Error('not implemented: ownerEmail');
}

/* ------------------------------------------------------------------ *
 * Task 11.5 - a hand-written validator
 *
 * The honest version of task 11.2's `as`. `isTestRun` checks the shape at
 * runtime and tells the compiler about it with a type predicate.
 *
 * A value is a TestRun when it is a plain object with:
 *   id          a string
 *   suite       a string
 *   durationMs  a number, and not NaN
 *   tags        an array whose every element is a string
 *
 * Extra properties are allowed - the data came from outside and an API
 * adding a field should not fail your suite.
 *
 * Then `parseTestRuns(raw)`: parse a JSON array and keep only the elements
 * that pass. Anything else - invalid JSON, a non-array - gives [].
 * ------------------------------------------------------------------ */
export interface TestRun {
  id: string;
  suite: string;
  durationMs: number;
  tags: string[];
}

export function isTestRun(value: unknown): boolean {
  // TODO: make the return type `value is TestRun`, then implement
  throw new Error('not implemented: isTestRun');
}

export function parseTestRuns(raw: string): TestRun[] {
  throw new Error('not implemented: parseTestRuns');
}

export type _M11TypeChecks = [_check_11_3];
