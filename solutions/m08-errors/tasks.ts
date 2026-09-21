/** Module 08 - reference solution. */

/* --- 8.1 ---------------------------------------------------------- *
 * `super(message)` first, then set `this.name`. Without the name assignment
 * every subclass still reports `name === 'Error'`, because `name` lives on
 * Error.prototype and subclassing does not change it.
 *
 * `public readonly timeoutMs: number` in the parameter list is TypeScript's
 * parameter property shorthand - it declares the field and assigns it.
 */
export class TimeoutError extends Error {
  constructor(
    public readonly timeoutMs: number,
    label: string,
  ) {
    super(`timed out after ${timeoutMs}ms waiting for ${label}`);
    this.name = 'TimeoutError';
  }
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';
  }
}

export class ValidationError extends Error {
  constructor(public readonly fields: string[]) {
    super(`invalid fields: ${fields.join(', ')}`);
    this.name = 'ValidationError';
  }
}

/*
 * Compatibility note you will eventually hit: when `tsconfig.json` targets
 * ES5, extending built-ins breaks `instanceof` because the transpiled
 * constructor loses the prototype link. The fix is one line after `super`:
 *
 *   Object.setPrototypeOf(this, TimeoutError.prototype);
 *
 * This repo targets ES2022, where classes are native and it is unnecessary.
 * Know the symptom anyway - "my custom error is not instanceof itself" is a
 * confusing hour otherwise.
 */

/* --- 8.2 ---------------------------------------------------------- */
export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);

  if (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  ) {
    return new Error((value as { message: string }).message);
  }

  try {
    // `JSON.stringify(undefined)` is undefined, not a string, hence `??`.
    return new Error(JSON.stringify(value) ?? String(value));
  } catch {
    // Circular structures throw. Never let the error normaliser be the thing
    // that throws - it runs in catch blocks, where a second throw hides the
    // first one entirely.
    return new Error(String(value));
  }
}

/* --- 8.3 ---------------------------------------------------------- *
 * The bug was the missing `await` on `fn()`.
 *
 * `try { return fn(); }` hands the promise back without ever waiting for it,
 * so the try block has already exited by the time the rejection happens. The
 * catch cannot fire, and `cleanup` on the success path ran before the work
 * finished. `return await fn()` keeps the call inside the try.
 *
 * Lint rules sometimes flag `return await` as redundant. Inside a try block
 * it is not redundant - it is load bearing.
 *
 * `finally` is the better shape here anyway: it runs on both paths, so the
 * cleanup call exists once instead of twice.
 */
export async function withCleanup<T>(
  fn: () => Promise<T>,
  cleanup: () => void,
): Promise<T> {
  try {
    return await fn();
  } finally {
    cleanup();
  }
}

/* --- 8.4 ---------------------------------------------------------- */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function success<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function failure<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function attempt<T>(fn: () => T): Result<T, Error> {
  try {
    return success(fn());
  } catch (error) {
    // `error` is `unknown` here. That is TypeScript being honest: JavaScript
    // lets you throw anything. `toError` is how you get back to solid ground.
    return failure(toError(error));
  }
}

export async function attemptAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    return success(await fn());
  } catch (error) {
    return failure(toError(error));
  }
}

export function unwrapOr<T>(result: Result<T, unknown>, fallback: T): T {
  return result.ok ? result.value : fallback;
}

/*
 * When to use Result and when to throw:
 *
 *  - Throw for programmer errors and for things no caller can handle.
 *  - Return a Result when failure is an expected outcome the caller must
 *    branch on - parsing, validation, a lookup that may legitimately miss.
 *
 * Do not convert an entire codebase to Result because it felt elegant once.
 * Mixed styles in one module are worse than either style consistently.
 */

/* --- 8.5 ---------------------------------------------------------- */
export function wrapError(message: string, cause: unknown): Error {
  // The second argument to the Error constructor is ES2022. It is the
  // standardised replacement for the half-dozen `originalError` conventions
  // every codebase invented.
  return new Error(message, { cause });
}

export function rootCause(error: Error): Error {
  let current = error;
  while (current.cause instanceof Error) {
    current = current.cause;
  }
  return current;
}

export function describeChain(error: Error): string {
  const messages: string[] = [];
  let current: Error | undefined = error;

  while (current !== undefined) {
    messages.push(current.message);
    current = current.cause instanceof Error ? current.cause : undefined;
  }

  return messages.join(' <- ');
}
