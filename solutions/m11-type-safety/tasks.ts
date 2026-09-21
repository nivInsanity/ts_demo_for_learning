/** Module 11 - reference solution. */

import type { Expect, Equal } from '../../src/_lib/type-assert';

/* --- 11.1 --------------------------------------------------------- */
export function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  // One assertion, in one place, immediately after the check that makes it
  // true. That is the difference between an assertion and a lie.
  return value as Record<string, unknown>;
}

export function getString(value: unknown, key: string): string | null {
  const record = asRecord(value);
  if (record === null) return null;

  const found = record[key];
  return typeof found === 'string' ? found : null;
}

/* --- 11.2 --------------------------------------------------------- *
 * The bug was `as AppConfig`.
 *
 * `JSON.parse` returns `any`, and `as AppConfig` tells the compiler to treat
 * whatever came back as a valid config. No check happens. `{}` becomes an
 * AppConfig whose `baseUrl` is `undefined` while its type says `string`, and
 * every downstream file now reasons about a fiction.
 *
 * The rule: validate once, at the boundary, and never assert your way past
 * data you did not create. Inside the boundary the types are true again.
 */
export interface AppConfig {
  baseUrl: string;
  retries: number;
  headless: boolean;
}

export function readConfig(raw: string): AppConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('invalid config: not JSON');
  }

  const record = asRecord(parsed) ?? {};

  if (typeof record['baseUrl'] !== 'string') throw new Error('invalid config: baseUrl');
  if (typeof record['retries'] !== 'number') throw new Error('invalid config: retries');
  if (typeof record['headless'] !== 'boolean') throw new Error('invalid config: headless');

  return {
    baseUrl: record['baseUrl'],
    retries: record['retries'],
    headless: record['headless'],
  };
}

/* --- 11.3 --------------------------------------------------------- *
 * `: Record<string, EnvConfig>` checks the values and then throws away what
 * the compiler inferred, leaving `string` keys.
 *
 * `satisfies` checks the value against the type and keeps the inferred type.
 * Same safety, no loss. Since TypeScript 4.9 there is almost no reason to
 * annotate a config object with its constraint instead of satisfying it.
 */
export interface EnvConfig {
  baseUrl: string;
  retries: number;
}

export const ENVIRONMENTS = {
  local: { baseUrl: 'http://localhost:3000', retries: 0 },
  staging: { baseUrl: 'https://staging.example.com', retries: 2 },
  prod: { baseUrl: 'https://example.com', retries: 3 },
} satisfies Record<string, EnvConfig>;

export type EnvName = keyof typeof ENVIRONMENTS;

export function configFor(env: EnvName): EnvConfig {
  return ENVIRONMENTS[env];
}

type _check_11_3 = Expect<Equal<EnvName, 'local' | 'staging' | 'prod'>>;

/* --- 11.4 --------------------------------------------------------- */
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
  // `?.` short-circuits the whole chain to `undefined` at the first missing
  // link, and `??` only falls back for null/undefined - so an owner whose
  // email is genuinely '' gets '' and not the fallback.
  return report.owner?.email ?? report.owner?.team?.lead?.email ?? 'unassigned@example.com';
}

/* --- 11.5 --------------------------------------------------------- */
export interface TestRun {
  id: string;
  suite: string;
  durationMs: number;
  tags: string[];
}

export function isTestRun(value: unknown): value is TestRun {
  const record = asRecord(value);
  if (record === null) return false;

  if (typeof record['id'] !== 'string') return false;
  if (typeof record['suite'] !== 'string') return false;
  if (typeof record['durationMs'] !== 'number' || Number.isNaN(record['durationMs'])) {
    return false;
  }

  const tags = record['tags'];
  if (!Array.isArray(tags)) return false;
  if (!tags.every((tag) => typeof tag === 'string')) return false;

  return true;
}

export function parseTestRuns(raw: string): TestRun[] {
  const parsed = parseJson(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isTestRun);
}

/*
 * Writing validators by hand is fine for three fields. For a real API
 * contract, a schema library (zod, valibot, typebox) gives you the runtime
 * check and the TypeScript type from one declaration, so they cannot
 * disagree. The point of doing it by hand once is that you then know exactly
 * what those libraries are doing, and why the alternative - `as ApiResponse`
 * on a fetch result - is not a cheaper version of the same thing but a
 * different thing that checks nothing.
 */

export type _M11TypeChecks = [_check_11_3];
