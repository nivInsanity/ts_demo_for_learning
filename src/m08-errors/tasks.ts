/**
 * Module 08 - Errors, `unknown` in catch, and Result
 *
 * Read src/m08-errors/README.md first.
 *
 * A test framework is, structurally, a very elaborate try/catch. Getting
 * error handling right is not a side topic for QA - it is the topic.
 */

/* ------------------------------------------------------------------ *
 * Task 8.1 - custom error classes
 *
 * Three errors, each carrying the data that makes the failure actionable.
 * A message alone forces whoever reads the log to parse English; a `status`
 * property lets code branch on it.
 *
 *   new TimeoutError(5000, 'cart badge')
 *     .message  -> 'timed out after 5000ms waiting for cart badge'
 *     .name     -> 'TimeoutError'
 *     .timeoutMs -> 5000
 *
 *   new HttpError(404, 'https://api.test/users/9')
 *     .message  -> 'HTTP 404 for https://api.test/users/9'
 *     .status   -> 404
 *     .url      -> 'https://api.test/users/9'
 *
 *   new ValidationError(['email', 'age'])
 *     .message  -> 'invalid fields: email, age'
 *     .fields   -> ['email', 'age']
 *
 * All three must be `instanceof Error` as well as `instanceof` themselves,
 * and each must set `this.name` - otherwise every one of them prints as
 * plain "Error" in a stack trace, which defeats the point.
 * ------------------------------------------------------------------ */
export class TimeoutError extends Error {
  // TODO: constructor(timeoutMs: number, label: string), expose `timeoutMs`
}

export class HttpError extends Error {
  // TODO: constructor(status: number, url: string), expose `status` and `url`
}

export class ValidationError extends Error {
  // TODO: constructor(fields: string[]), expose `fields`
}

/* ------------------------------------------------------------------ *
 * Task 8.2 - normalising whatever a catch block gives you
 *
 * In TypeScript, `catch (error)` gives you `unknown`. Not `Error` - because
 * JavaScript lets you `throw 'a string'`, `throw 42`, or `throw undefined`,
 * and libraries do.
 *
 * `toError` turns any thrown value into an Error:
 *   an Error            -> that exact object, unchanged
 *   a string            -> new Error(thatString)
 *   { message: string } -> new Error(thatMessage)
 *   anything else       -> new Error(JSON.stringify(value)), falling back to
 *                          String(value) when it is not serialisable
 *
 * `null` becomes Error('null'), `undefined` becomes Error('undefined').
 * ------------------------------------------------------------------ */
export function toError(value: unknown): Error {
  throw new Error('not implemented: toError');
}

/* ------------------------------------------------------------------ *
 * Task 8.3 - find the bug
 *
 * `withCleanup` should run `fn`, and run `cleanup` exactly once whether `fn`
 * succeeds or fails, then let the original outcome through.
 *
 * On the happy path it works. When `fn` rejects, `cleanup` never runs, the
 * browser stays open, the temp directory stays on disk, and the next test
 * inherits the mess.
 *
 * The bug is one missing word. It is the same word from module 07.
 * ------------------------------------------------------------------ */
export async function withCleanup<T>(
  fn: () => Promise<T>,
  cleanup: () => void,
): Promise<T> {
  try {
    const result = fn();
    cleanup();
    return result;
  } catch (error) {
    cleanup();
    throw error;
  }
}

/* ------------------------------------------------------------------ *
 * Task 8.4 - the Result type
 *
 * Sometimes a failure is not exceptional - it is one of two normal outcomes,
 * and you want the type system to force the caller to deal with both. That
 * is what a Result (Either, Try, whatever your last language called it) is.
 *
 * Define:
 *   type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }
 *
 * Implement:
 *   success(value)            -> { ok: true, value }
 *   failure(error)            -> { ok: false, error }
 *   attempt(fn)               -> runs a sync fn, catching anything it throws
 *                                (normalised through `toError`)
 *   attemptAsync(fn)          -> the same for a promise-returning fn
 *   unwrapOr(result, fallback)-> the value, or the fallback on failure
 *
 * Because `ok` is a literal-typed discriminant, `if (result.ok)` narrows -
 * this is module 04 doing real work.
 * ------------------------------------------------------------------ */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export function success<T>(value: T): Result<T, never> {
  throw new Error('not implemented: success');
}

export function failure<E>(error: E): Result<never, E> {
  throw new Error('not implemented: failure');
}

export function attempt<T>(fn: () => T): Result<T, Error> {
  throw new Error('not implemented: attempt');
}

export function attemptAsync<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  throw new Error('not implemented: attemptAsync');
}

export function unwrapOr<T>(result: Result<T, unknown>, fallback: T): T {
  throw new Error('not implemented: unwrapOr');
}

/* ------------------------------------------------------------------ *
 * Task 8.5 - error chains
 *
 * `new Error('msg', { cause: original })` is the standard way to add context
 * without destroying the original diagnosis. Re-throwing
 * `new Error(original.message)` throws away the stack trace and the type,
 * which is how a useful "ECONNREFUSED 127.0.0.1:5432" becomes an unhelpful
 * "could not load fixtures".
 *
 *   wrapError('loading fixtures failed', original)
 *     -> an Error with that message and `.cause === original`
 *
 *   rootCause(error) -> walks `.cause` as far as it goes and returns the
 *                       deepest Error (the error itself when there is none)
 *
 *   describeChain(error) -> messages from outermost to innermost, joined
 *                           with ' <- ', e.g.
 *                           'loading fixtures failed <- HTTP 500 for /seed'
 * ------------------------------------------------------------------ */
export function wrapError(message: string, cause: unknown): Error {
  throw new Error('not implemented: wrapError');
}

export function rootCause(error: Error): Error {
  throw new Error('not implemented: rootCause');
}

export function describeChain(error: Error): string {
  throw new Error('not implemented: describeChain');
}
