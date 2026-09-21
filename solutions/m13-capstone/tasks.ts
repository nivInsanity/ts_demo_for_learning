/** Module 13 - reference solution. */

import type { Transport, HttpRequest, HttpResponse } from '../../src/_lib/fake-transport';

/* --- provided ------------------------------------------------------ */

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
export type Validator<T> = (value: unknown, path?: string) => Validation<T>;
export type Infer<V> = V extends Validator<infer T> ? T : never;

/* --- 13.1 --------------------------------------------------------- */

/**
 * `typeof` with the two answers everyone wishes it gave: null is 'null'
 * (module 04's bug) and an array is 'array', not 'object'.
 */
function typeName(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function primitive<T>(expected: string, check: (value: unknown) => boolean): Validator<T> {
  return (value, path = '$') =>
    check(value)
      ? { valid: true, value: value as T }
      : { valid: false, errors: [`${path}: expected ${expected}, got ${typeName(value)}`] };
}

export const str: Validator<string> = primitive('string', (v) => typeof v === 'string');

export const num: Validator<number> = (value, path = '$') => {
  if (typeof value !== 'number') {
    return { valid: false, errors: [`${path}: expected number, got ${typeName(value)}`] };
  }
  // NaN is a number as far as `typeof` is concerned, and useless as one.
  // A schema that lets NaN through produces reports full of "NaN%".
  if (Number.isNaN(value)) {
    return { valid: false, errors: [`${path}: expected number, got NaN`] };
  }
  return { valid: true, value };
};

export const bool: Validator<boolean> = primitive('boolean', (v) => typeof v === 'boolean');

export function arrayOf<T>(item: Validator<T>): Validator<T[]> {
  return (value, path = '$') => {
    if (!Array.isArray(value)) {
      return { valid: false, errors: [`${path}: expected array, got ${typeName(value)}`] };
    }

    const errors: string[] = [];
    const out: T[] = [];

    // Collecting every error rather than returning on the first one is the
    // difference between "your payload is wrong" and "these three fields
    // are wrong". Only one of those is a useful bug report.
    value.forEach((element, index) => {
      const result = item(element, `${path}[${index}]`);
      if (result.valid) out.push(result.value);
      else errors.push(...result.errors);
    });

    return errors.length > 0 ? { valid: false, errors } : { valid: true, value: out };
  };
}

export function optional<T>(inner: Validator<T>): Validator<T | undefined> {
  return (value, path = '$') =>
    value === undefined ? { valid: true, value: undefined } : inner(value, path);
}

export function objectOf<S extends Record<string, Validator<unknown>>>(
  shape: S,
): Validator<{ [K in keyof S]: Infer<S[K]> }> {
  type Out = { [K in keyof S]: Infer<S[K]> };

  return (value, path = '$') => {
    const actual = typeName(value);
    if (actual !== 'object') {
      return { valid: false, errors: [`${path}: expected object, got ${actual}`] };
    }

    const record = value as Record<string, unknown>;
    const errors: string[] = [];
    const out: Record<string, unknown> = {};

    // `Object.keys(shape)` - the SHAPE's keys, not the value's. That is what
    // makes extra properties harmless: we simply never look at them.
    for (const key of Object.keys(shape)) {
      const result = shape[key]!(record[key], `${path}.${key}`);
      if (result.valid) out[key] = result.value;
      else errors.push(...result.errors);
    }

    return errors.length > 0
      ? { valid: false, errors }
      : { valid: true, value: out as Out };
  };
}

/* --- 13.2 --------------------------------------------------------- */
export interface ApiClientOptions {
  retries?: number;
  retryOn?: (status: number) => boolean;
}

export class ApiClient {
  #attempts = 0;

  constructor(
    private readonly transport: Transport,
    private readonly options: ApiClientOptions = {},
  ) {}

  get attempts(): number {
    return this.#attempts;
  }

  async request<T>(req: HttpRequest, schema: Validator<T>): Promise<T> {
    const retries = this.options.retries ?? 2;
    const retryOn = this.options.retryOn ?? ((status: number) => status >= 500);

    this.#attempts = 0;
    let response: HttpResponse;

    for (;;) {
      response = await this.transport.send(req);
      this.#attempts += 1;
      if (!retryOn(response.status) || this.#attempts > retries) break;
    }

    // Order matters. Status first: a 500 with an HTML error page should be
    // reported as a 500, not as a schema mismatch.
    if (response.status < 200 || response.status >= 300) {
      throw new HttpError(response.status, req.path);
    }

    const result = schema(response.body, '$');
    if (!result.valid) {
      // Deliberately NOT retried. A wrong shape on a 200 is a contract
      // change, and hammering the endpoint two more times will not fix it -
      // it just triples the time it takes to find out.
      throw new SchemaError(result.errors);
    }

    return result.value;
  }
}

/* --- 13.3 --------------------------------------------------------- */
export function oneOf<const T extends readonly string[]>(values: T): Validator<T[number]> {
  // The `const` type parameter modifier (TypeScript 5.0) is what keeps
  // `oneOf(['admin', 'user'])` as `readonly ['admin', 'user']` instead of
  // widening to `string[]`. Without it the caller would need `as const`.
  return (value, path = '$') => {
    if (typeof value === 'string' && (values as readonly string[]).includes(value)) {
      return { valid: true, value: value as T[number] };
    }
    const allowed = values.map((v) => JSON.stringify(v)).join(', ');
    return {
      valid: false,
      errors: [`${path}: expected one of ${allowed}, got ${JSON.stringify(value)}`],
    };
  };
}

export const userSchema = objectOf({
  id: num,
  email: str,
  role: oneOf(['admin', 'user', 'guest']),
  tags: arrayOf(str),
  nickname: optional(str),
});

export type User = Infer<typeof userSchema>;

/**
 * An identity mapped type. It changes nothing semantically, but it flattens
 * an intersection into a single object type - which is both easier to read
 * in an editor tooltip and what the `Equal<...>` assertion in the tests
 * compares against.
 */
type Flatten<T> = { [K in keyof T]: T[K] };

export type CreateUserInput = Flatten<
  Omit<User, 'id' | 'tags' | 'nickname'> & Partial<Pick<User, 'tags' | 'nickname'>>
>;

export class UsersApi {
  constructor(private readonly client: ApiClient) {}

  listUsers(): Promise<User[]> {
    return this.client.request({ method: 'GET', path: '/users' }, arrayOf(userSchema));
  }

  getUser(id: number): Promise<User> {
    return this.client.request({ method: 'GET', path: `/users/${id}` }, userSchema);
  }

  createUser(input: CreateUserInput): Promise<User> {
    return this.client.request({ method: 'POST', path: '/users', body: input }, userSchema);
  }
}

export type { Transport };

/*
 * What you just built, and what it maps onto:
 *
 *   str / objectOf / arrayOf   ->  zod, valibot, typebox
 *   ApiClient.request          ->  the retry + validate layer every API test
 *                                  suite ends up writing
 *   UsersApi                   ->  a page object, for an API instead of a page
 *
 * The point is not that you should ship this instead of zod. It is that you
 * now know what those libraries do, which failure modes they remove, and
 * which ones they do not - so you can read their error messages instead of
 * guessing at them.
 */
