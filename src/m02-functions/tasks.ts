/**
 * Module 02 - Functions
 *
 * Read src/m02-functions/README.md first.
 */

/* ------------------------------------------------------------------ *
 * Task 2.1 - optional parameters and object params
 *
 * Build a request URL.
 *
 *   buildUrl('https://api.example.com', '/v2/health')
 *     -> 'https://api.example.com/v2/health'
 *
 *   buildUrl('https://api.example.com/', 'search', { q: 'a b', page: 2 })
 *     -> 'https://api.example.com/search?page=2&q=a%20b'
 *
 * Rules:
 *  - exactly one slash between base and path, whatever the caller passes
 *  - no trailing slash when `path` is empty
 *  - query keys are sorted alphabetically so the output is deterministic
 *    (a URL that changes order between runs breaks snapshot tests)
 *  - values are percent-encoded; booleans become "true"/"false"
 *  - no "?" at all when there is no query
 * ------------------------------------------------------------------ */
export type QueryValue = string | number | boolean;

export function buildUrl(
  base: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  throw new Error('not implemented: buildUrl');
}

/* ------------------------------------------------------------------ *
 * Task 2.2 - rest parameters
 *
 * Join path segments with exactly one slash between them.
 *
 *   joinPaths('api', 'v2', 'health')      -> 'api/v2/health'
 *   joinPaths('/api/', '/v2/', 'health')  -> '/api/v2/health'
 *   joinPaths('api', '', 'health')        -> 'api/health'
 *   joinPaths()                           -> ''
 *
 * A leading slash on the first segment is preserved. Trailing slashes are not.
 * ------------------------------------------------------------------ */
export function joinPaths(...parts: string[]): string {
  throw new Error('not implemented: joinPaths');
}

/* ------------------------------------------------------------------ *
 * Task 2.3 - find the bug
 *
 * This resolves user supplied run options against defaults. It compiles,
 * the happy path works, and it has burned real people.
 *
 * Symptoms to reproduce:
 *  - passing `retries: 0` ("do not retry") silently gives you 2 retries
 *  - passing `headless: false` silently gives you headless: true
 *  - passing `baseUrl: ''` silently gives you the default base URL
 *
 * Fix it without changing the signature.
 * ------------------------------------------------------------------ */
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
    baseUrl: options.baseUrl || 'https://staging.example.com',
    retries: options.retries || 2,
    timeoutMs: options.timeoutMs || 30_000,
    headless: options.headless || true,
  };
}

/* ------------------------------------------------------------------ *
 * Task 2.4 - function overloads
 *
 * `range` should be callable in three shapes:
 *
 *   range(3)         -> [0, 1, 2]
 *   range(2, 5)      -> [2, 3, 4]
 *   range(0, 10, 3)  -> [0, 3, 6, 9]
 *   range(5, 0, -1)  -> [5, 4, 3, 2, 1]
 *
 * The signature below accepts `range()` and `range(1, 2, 3, 4)`, which are
 * both nonsense. Replace it with three overload signatures plus one
 * implementation signature, then implement it.
 *
 * `step === 0` must throw a RangeError - otherwise you get an infinite loop,
 * and an infinite loop in a test suite is a very expensive way to find out.
 * ------------------------------------------------------------------ */
export function range(...args: number[]): number[] {
  throw new Error('not implemented: range');
}

/* ------------------------------------------------------------------ *
 * Task 2.5 - functions as values
 *
 * A `Validator` takes a value and returns an error message, or null when the
 * value is fine. This is the shape most form-validation and API-contract
 * helpers converge on.
 *
 * Implement:
 *  - `required(field)`      -> a Validator that rejects '' and whitespace
 *  - `maxLength(field, n)`  -> a Validator that rejects longer strings
 *  - `matches(field, re, message)` -> a Validator backed by a regex
 *  - `runValidators(value, validators)` -> every error message, in order
 *
 * Note that the first three RETURN validators. A function that builds a
 * function is the single most useful pattern in test tooling.
 * ------------------------------------------------------------------ */
export type Validator = (value: string) => string | null;

export function required(field: string): Validator {
  throw new Error('not implemented: required');
}

export function maxLength(field: string, limit: number): Validator {
  throw new Error('not implemented: maxLength');
}

export function matches(field: string, pattern: RegExp, message: string): Validator {
  throw new Error('not implemented: matches');
}

export function runValidators(value: string, validators: Validator[]): string[] {
  throw new Error('not implemented: runValidators');
}
