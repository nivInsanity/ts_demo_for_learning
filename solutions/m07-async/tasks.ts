/** Module 07 - reference solution. */

/* --- 7.1 ---------------------------------------------------------- */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`timed out after ${ms}ms waiting for ${label}`));
    }, ms);
  });

  // `race` settles with whichever promise settles first. `finally` runs on
  // both paths, which is what stops the timer outliving the call. Without
  // that `clearTimeout`, a suite full of these keeps the event loop busy and
  // Node refuses to exit.
  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
  });
}

/* --- 7.2 ---------------------------------------------------------- */
export interface RetryOptions {
  attempts: number;
  delayMs?: number;
  factor?: number;
  onRetry?: (error: unknown, attempt: number) => void;
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { attempts, delayMs = 0, factor = 1, onRetry } = options;

  if (attempts < 1) {
    throw new RangeError(`retry: attempts must be at least 1, got ${attempts}`);
  }

  let wait = delayMs;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      // `return await` inside try is deliberate: without the `await` the
      // rejection escapes the try block and the catch never runs.
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;

      onRetry?.(error, attempt);
      if (wait > 0) await delay(wait);
      wait *= factor;
    }
  }

  throw lastError;
}

/* --- 7.3 ---------------------------------------------------------- *
 * The bug: `Array.prototype.forEach` does not await its callback.
 *
 * An `async` callback returns a promise. `forEach` ignores return values, so
 * it fires all three callbacks, each of them suspends at its first `await`,
 * and `forEach` returns immediately with nothing pushed yet. `runAll` then
 * returns the still-empty array.
 *
 * `map`, `filter` and `sort` have the same blind spot. Only `for...of`
 * respects `await`, because `await` there suspends the enclosing function.
 *
 *   for (const t of tasks) results.push(await t());   // sequential
 *   await Promise.all(tasks.map(t => t()));           // parallel
 *
 * Both are correct; they answer different questions. The spec here asks for
 * one at a time, in order.
 */
export async function runAll(tasks: Array<() => Promise<string>>): Promise<string[]> {
  const results: string[] = [];

  for (const task of tasks) {
    results.push(await task());
  }

  return results;
}

/* --- 7.4 ---------------------------------------------------------- */
export interface WaitForOptions {
  timeoutMs?: number;
  intervalMs?: number;
  label?: string;
}

export async function waitFor(
  predicate: () => boolean | Promise<boolean>,
  options: WaitForOptions = {},
): Promise<void> {
  const { timeoutMs = 2_000, intervalMs = 50, label = 'condition' } = options;
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    try {
      // `await` on a non-promise is fine - it just resolves on the next tick.
      // That is what lets one implementation accept sync and async predicates.
      if (await predicate()) return;
    } catch {
      // A predicate that throws means "not ready yet". An element lookup
      // failing before the page has rendered is the normal case, not an error.
    }

    if (Date.now() >= deadline) {
      throw new Error(`condition not met within ${timeoutMs}ms: ${label}`);
    }

    await delay(intervalMs);
  }
}

/* --- 7.5 ---------------------------------------------------------- */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (limit < 1) {
    throw new RangeError(`mapWithConcurrency: limit must be at least 1, got ${limit}`);
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  // The worker-pool shape: spawn `limit` loops that each pull the next index
  // off a shared cursor until the queue is empty. Results go into a
  // pre-sized array by index, so completion order never affects output order.
  const worker = async (): Promise<void> => {
    for (;;) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await fn(items[index]!, index);
    }
  };

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  // `Promise.all` rejects on the first rejection, which is the required
  // behaviour. If you wanted every result regardless, that is `allSettled`.
  await Promise.all(workers);

  return results;
}
