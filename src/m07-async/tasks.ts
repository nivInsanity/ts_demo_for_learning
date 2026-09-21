/**
 * Module 07 - Promises, async/await and time
 *
 * Read src/m07-async/README.md first.
 *
 * This is the module that pays your salary. Waiting for things correctly -
 * with a bound, with a retry, without an unhandled rejection - is most of
 * what separates a test suite people trust from one people rerun until green.
 */

/* ------------------------------------------------------------------ *
 * Task 7.1 - delay and withTimeout
 *
 * `delay(ms)` resolves after roughly `ms` milliseconds.
 *
 * `withTimeout(promise, ms, label)`:
 *  - resolves with the promise's value if it settles first
 *  - rejects with the promise's error if it rejects first
 *  - otherwise rejects with `Error` whose message is exactly
 *      `timed out after <ms>ms waiting for <label>`
 *  - must not leave a dangling timer behind when the promise wins
 *
 * That last point is not pedantry. A leaked timer keeps the Node process
 * alive after your suite finishes, and you get a CI job that "hangs" at 100%.
 * ------------------------------------------------------------------ */
export function delay(ms: number): Promise<void> {
  throw new Error('not implemented: delay');
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  throw new Error('not implemented: withTimeout');
}

/* ------------------------------------------------------------------ *
 * Task 7.2 - retry with backoff
 *
 *   await retry(attempt => fetchStatus(), { attempts: 3, delayMs: 10, factor: 2 })
 *
 * Rules:
 *  - `fn` receives the 1-based attempt number
 *  - return the first successful value
 *  - after the final attempt fails, throw THAT error (not a wrapper)
 *  - wait `delayMs` before attempt 2, `delayMs * factor` before attempt 3,
 *    `delayMs * factor^2` before attempt 4, and so on
 *  - never wait after the last attempt - that is pure dead time in CI
 *  - call `onRetry(error, attempt)` after each failed attempt that will be
 *    retried, and not after the last one
 *  - `attempts < 1` throws a RangeError before calling `fn` at all
 *
 * Defaults: delayMs 0, factor 1, onRetry undefined.
 * ------------------------------------------------------------------ */
export interface RetryOptions {
  attempts: number;
  delayMs?: number;
  factor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

export function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  throw new Error('not implemented: retry');
}

/* ------------------------------------------------------------------ *
 * Task 7.3 - find the bug
 *
 * `runAll` should run the tasks one after another and return their results
 * in order. It returns an empty array instead, and it returns it before any
 * of the tasks have finished.
 *
 * This is the most common async bug in JavaScript and the reason a lot of
 * people believe `forEach` is broken. It is not broken. It is doing exactly
 * what it says.
 * ------------------------------------------------------------------ */
export async function runAll(tasks: Array<() => Promise<string>>): Promise<string[]> {
  const results: string[] = [];

  tasks.forEach(async (task) => {
    results.push(await task());
  });

  return results;
}

/* ------------------------------------------------------------------ *
 * Task 7.4 - polling
 *
 * `waitFor` is the primitive behind every `expect(...).toBeVisible()` you
 * have ever written.
 *
 *  - evaluate the predicate immediately, before any waiting
 *  - if it is falsy, wait `intervalMs` and try again
 *  - the predicate may be sync or async - `() => boolean | Promise<boolean>`
 *  - resolve as soon as it is truthy
 *  - after `timeoutMs` total, reject with `Error` whose message is exactly
 *      `condition not met within <timeoutMs>ms: <label>`
 *  - if the predicate throws, treat that as "not yet" and keep polling
 *
 * Defaults: timeoutMs 2000, intervalMs 50, label 'condition'.
 *
 * The "predicate throws means not yet" rule matters: a selector lookup that
 * throws because the element is not in the DOM *yet* is the normal case,
 * not an error.
 * ------------------------------------------------------------------ */
export interface WaitForOptions {
  timeoutMs?: number;
  intervalMs?: number;
  label?: string;
}

export function waitFor(
  predicate: () => boolean | Promise<boolean>,
  options?: WaitForOptions,
): Promise<void> {
  throw new Error('not implemented: waitFor');
}

/* ------------------------------------------------------------------ *
 * Task 7.5 - bounded concurrency
 *
 * `Promise.all(items.map(fn))` starts everything at once. With 500 API
 * calls that is how you get rate limited, or how you take down the staging
 * environment ten minutes before a demo.
 *
 * `mapWithConcurrency(items, limit, fn)`:
 *  - runs at most `limit` calls at a time
 *  - returns results in INPUT order, regardless of completion order
 *  - rejects as soon as any call rejects
 *  - `limit < 1` throws a RangeError
 *  - an empty input resolves to an empty array without calling `fn`
 * ------------------------------------------------------------------ */
export function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  throw new Error('not implemented: mapWithConcurrency');
}
