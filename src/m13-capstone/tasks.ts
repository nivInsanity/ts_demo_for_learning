/**
 * Module 13 - Capstone: a typed API testing toolkit
 *
 * Read src/m13-capstone/README.md first.
 *
 * No new syntax here. This is everything from modules 01-12 assembled into
 * something you could genuinely put in a repository: a schema validator, an
 * HTTP client that retries and validates, and a typed API wrapper on top.
 *
 * Take your time. This one is meant to be hard.
 */

import type { Transport, HttpRequest } from '../_lib/fake-transport';

/* ================================================================== *
 * Provided - you do not need to change these.
 * ================================================================== */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
  ) {
    super(`HTTP ${status} for ${path}`);
    this.name = 'HttpError';
  }
}

export class SchemaError extends Error {
  constructor(public readonly errors: string[]) {
    super(`response did not match schema:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
    this.name = 'SchemaError';
  }
}

export type Validation<T> = { valid: true; value: T } | { valid: false; errors: string[] };

/**
 * A validator takes an unknown value and a path used for error messages,
 * and reports either the typed value or every problem it found.
 */
export type Validator<T> = (value: unknown, path?: string) => Validation<T>;

/** The type a validator produces. `Infer<typeof userSchema>` is a User. */
export type Infer<V> = V extends Validator<infer T> ? T : never;

/* ================================================================== *
 * Task 13.1 - schema validators
 *
 * Build a tiny validation library out of combinators. Error messages look
 * like `<path>: expected <type>, got <actual>` where `<actual>` is the same
 * vocabulary `typeof` uses, except that null is 'null' and an array is
 * 'array'. The default path is '$'.
 *
 *   str(42)                    -> { valid: false, errors: ['$: expected string, got number'] }
 *   str('x')                   -> { valid: true, value: 'x' }
 *   num(NaN)                   -> invalid: NaN is not a usable number
 *   arrayOf(str)(['a', 2])     -> ['$[1]: expected string, got number']
 *   objectOf({ id: num })({})  -> ['$.id: expected number, got undefined']
 *
 * Rules:
 *  - `arrayOf` reports EVERY bad element, not just the first
 *  - `objectOf` reports EVERY bad property, in declaration order
 *  - `objectOf` rejects null, arrays and primitives with
 *      `<path>: expected object, got <actual>`
 *  - `objectOf` ignores extra properties - an API adding a field must not
 *    break your suite
 *  - `optional(inner)` accepts `undefined` (and a missing property) and
 *    otherwise delegates
 * ================================================================== */
export const str: Validator<string> = () => {
  throw new Error('not implemented: str');
};

export const num: Validator<number> = () => {
  throw new Error('not implemented: num');
};

export const bool: Validator<boolean> = () => {
  throw new Error('not implemented: bool');
};

export function arrayOf<T>(item: Validator<T>): Validator<T[]> {
  // Note the shape of the stub: these factories must RETURN a validator.
  // Throwing here instead would blow up at import time, because `userSchema`
  // below calls `objectOf` while the module is still loading.
  return () => {
    throw new Error('not implemented: arrayOf');
  };
}

export function optional<T>(inner: Validator<T>): Validator<T | undefined> {
  return () => {
    throw new Error('not implemented: optional');
  };
}

export function objectOf<S extends Record<string, Validator<unknown>>>(
  shape: S,
): Validator<{ [K in keyof S]: Infer<S[K]> }> {
  return () => {
    throw new Error('not implemented: objectOf');
  };
}

/* ================================================================== *
 * Task 13.2 - the client
 *
 * `ApiClient` wraps a `Transport` and adds the three things a raw transport
 * does not give you: retries on transient failures, an error type you can
 * branch on, and a guarantee that the body is the shape you claimed.
 *
 * `request(req, schema)`:
 *  1. send the request through the transport
 *  2. if the status is retryable and attempts remain, send it again -
 *     up to `retries` EXTRA attempts (default 2, so 3 attempts in total)
 *  3. once out of retries, or on a non-retryable status:
 *       - not 2xx           -> throw HttpError(status, path)
 *       - body fails schema -> throw SchemaError(errors)
 *       - otherwise         -> return the validated, typed value
 *
 * Retryable by default: any status >= 500. `options.retryOn` replaces that
 * rule entirely when supplied.
 *
 * There is no sleeping between attempts - a fake transport does not need it,
 * and a test suite that sleeps is a test suite nobody runs. In production
 * you would compose this with the `retry` you wrote in module 07.
 *
 * `attempts` reports how many transport calls the last `request` made.
 * ================================================================== */
export interface ApiClientOptions {
  retries?: number;
  retryOn?: (status: number) => boolean;
}

export class ApiClient {
  // TODO: constructor(transport: Transport, options?: ApiClientOptions)

  request<T>(req: HttpRequest, schema: Validator<T>): Promise<T> {
    throw new Error('not implemented: ApiClient.request');
  }

  get attempts(): number {
    throw new Error('not implemented: ApiClient.attempts');
  }
}

/* ================================================================== *
 * Task 13.3 - a typed API surface
 *
 * The layer a test author actually touches. Define the schemas, let the
 * types fall out of them with `Infer`, and expose three methods.
 *
 *   userSchema      { id: number; email: string; role: 'admin'|'user'|'guest';
 *                     tags: string[]; nickname: string | undefined }
 *   User            = Infer<typeof userSchema>
 *
 * `role` needs a validator you have not written yet: `oneOf`. Write it -
 * the signature is given below, and a literal-preserving return type is the
 * interesting part.
 *
 * `UsersApi`:
 *   listUsers()            GET  /users        -> User[]
 *   getUser(id)            GET  /users/<id>   -> User
 *   createUser(input)      POST /users        -> User, body is `input`
 *
 * `CreateUserInput` is a User without `id`, with `tags` and `nickname`
 * optional. Derive it - do not retype it.
 * ================================================================== */
export function oneOf<const T extends readonly string[]>(
  values: T,
): Validator<T[number]> {
  return () => {
    throw new Error('not implemented: oneOf');
  };
}

export const userSchema = objectOf({
  // TODO: id, email, role, tags, nickname
});

export type User = Infer<typeof userSchema>;

export type CreateUserInput = never; // TODO: derive from User

export class UsersApi {
  // TODO: constructor(client: ApiClient)

  listUsers(): Promise<User[]> {
    throw new Error('not implemented: UsersApi.listUsers');
  }

  getUser(id: number): Promise<User> {
    throw new Error('not implemented: UsersApi.getUser');
  }

  createUser(input: CreateUserInput): Promise<User> {
    throw new Error('not implemented: UsersApi.createUser');
  }
}

// Keeps the Transport import meaningful for the starter file.
export type { Transport };
