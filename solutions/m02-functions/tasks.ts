/** Module 02 - reference solution. */

/* --- 2.1 ---------------------------------------------------------- */
export type QueryValue = string | number | boolean;

export function buildUrl(
  base: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  const url = cleanPath === '' ? cleanBase : `${cleanBase}/${cleanPath}`;

  const entries = Object.entries(query ?? {});
  if (entries.length === 0) return url;

  // Sorting on raw code points rather than `localeCompare` keeps the output
  // identical on every machine and CI runner. Locale-aware sorting has
  // produced genuinely baffling snapshot diffs.
  const search = entries
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${url}?${search}`;
}

/* --- 2.2 ---------------------------------------------------------- */
export function joinPaths(...parts: string[]): string {
  const leadingSlash = parts[0]?.startsWith('/') ? '/' : '';

  const segments = parts
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .filter((part) => part !== '');

  return leadingSlash + segments.join('/');
}

/* --- 2.3 ---------------------------------------------------------- *
 * The bug was `||`.
 *
 * `||` falls back for every falsy value: 0, '', false, NaN. `??` falls back
 * only for null and undefined, which is what "the caller did not supply this"
 * actually means. Since TypeScript 3.7 there is no reason to write `||` for
 * defaults unless you genuinely want falsy-means-missing.
 */
export interface RunOptions {
  baseUrl?: string;
  retries?: number;
  timeoutMs?: number;
  headless?: boolean;
}

export interface ResolvedRunOptions {
  baseUrl: string;
  retries: number;
  timeoutMs: number;
  headless: boolean;
}

export function resolveRunOptions(options: RunOptions = {}): ResolvedRunOptions {
  return {
    baseUrl: options.baseUrl ?? 'https://staging.example.com',
    retries: options.retries ?? 2,
    timeoutMs: options.timeoutMs ?? 30_000,
    headless: options.headless ?? true,
  };
}

/* --- 2.4 ---------------------------------------------------------- *
 * The three lines without a body are overload signatures - the only shapes
 * a caller may use. The fourth signature is the implementation; it is NOT
 * visible to callers, which is why it can be loose.
 */
export function range(end: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number, end: number, step: number): number[];
export function range(a: number, b?: number, step = 1): number[] {
  if (step === 0) throw new RangeError('range: step must not be 0');

  const start = b === undefined ? 0 : a;
  const end = b === undefined ? a : b;

  const out: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) out.push(i);
  } else {
    for (let i = start; i > end; i += step) out.push(i);
  }
  return out;
}

/* --- 2.5 ---------------------------------------------------------- */
export type Validator = (value: string) => string | null;

export function required(field: string): Validator {
  return (value) => (value.trim() === '' ? `${field} is required` : null);
}

export function maxLength(field: string, limit: number): Validator {
  return (value) =>
    value.length > limit ? `${field} must be at most ${limit} characters` : null;
}

export function matches(field: string, pattern: RegExp, message: string): Validator {
  // `field` is unused in the message here, but keeping it in the signature
  // makes every validator factory read the same way at the call site.
  void field;
  return (value) => (pattern.test(value) ? null : message);
}

export function runValidators(value: string, validators: Validator[]): string[] {
  // `flatMap` + a conditional array is a tidy way to say "keep the non-nulls"
  // while staying type safe; `filter(Boolean)` would leave you with
  // `(string | null)[]` as far as the compiler is concerned.
  return validators.flatMap((validate) => {
    const error = validate(value);
    return error === null ? [] : [error];
  });
}
