/**
 * Module 05 - Generics
 *
 * Read src/m05-generics/README.md first.
 *
 * A generic is a type parameter: a hole in a signature that the caller fills
 * in, usually without noticing. `Array<T>`, `Promise<T>`, `Map<K, V>` and
 * every test fixture you will ever write are generic.
 */

import type { Expect, Equal } from '../_lib/type-assert';

/* ------------------------------------------------------------------ *
 * Task 5.1 - your first three generics
 *
 *   first([1, 2, 3])            -> 1            (typed number | undefined)
 *   first([])                   -> undefined
 *   last(['a', 'b'])            -> 'b'          (typed string | undefined)
 *   compact([1, null, 2, undefined]) -> [1, 2]  (typed number[])
 *
 * `compact` is the interesting one: its parameter is
 * `(T | null | undefined)[]` and its return is `T[]`, so the nullability
 * disappears from the type as well as from the array.
 * ------------------------------------------------------------------ */
export function first<T>(items: T[]): T | undefined {
  throw new Error('not implemented: first');
}

export function last<T>(items: T[]): T | undefined {
  throw new Error('not implemented: last');
}

export function compact<T>(items: (T | null | undefined)[]): T[] {
  throw new Error('not implemented: compact');
}

/* ------------------------------------------------------------------ *
 * Task 5.2 - constrained generics: `K extends keyof T`
 *
 * The signatures below use `any`, which means `pluck(users, 'nmae')` compiles
 * and returns `any[]`. Both of those are unacceptable.
 *
 * Rewrite them as:
 *   pluck<T, K extends keyof T>(items: T[], key: K): T[K][]
 *   indexBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T>
 *
 * `keyof T` is the union of T's property names. `T[K]` is an *indexed access
 * type* - the type of the property named K. Together they let the compiler
 * know that plucking 'name' off `{ name: string }[]` gives you `string[]`,
 * and that 'nmae' is not a thing.
 *
 * `indexBy` keeps the LAST item when two share a key.
 * ------------------------------------------------------------------ */
export function pluck(items: any[], key: string): any[] {
  throw new Error('not implemented: pluck');
}

export function indexBy(items: any[], key: string): Map<any, any> {
  throw new Error('not implemented: indexBy');
}

/* ------------------------------------------------------------------ *
 * Task 5.3 - find the bug
 *
 * `groupBy` should bucket items by a computed key. It compiles, the types are
 * fine, and it quietly throws away data.
 *
 *   groupBy(['ant', 'bee', 'ape'], w => w[0])
 *     -> { a: ['ant', 'ape'], b: ['bee'] }
 *
 * Run the test, read what it actually returns, and fix it.
 * ------------------------------------------------------------------ */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const key = keyFn(item);
    groups[key] = [item];
  }

  return groups;
}

/* ------------------------------------------------------------------ *
 * Task 5.4 - a generic class
 *
 * A registry of test-data factories. Register a named factory once, then ask
 * for fresh objects by name. Every registry instance is typed to one kind of
 * object, so a `TestDataRegistry<User>` cannot hand you an Order.
 *
 *   const users = new TestDataRegistry<User>();
 *   users.register('admin', () => ({ id: 1, role: 'admin' }));
 *   users.create('admin');            // typed User
 *   users.create('nope');             // throws Error('unknown factory: nope')
 *
 * Requirements:
 *  - `register` overwrites an existing name silently
 *  - `create` calls the factory every time, so two calls give two objects
 *  - `has(name)` -> boolean
 *  - `names()` -> registered names in registration order
 *  - `create` on an unknown name throws `Error` with the exact message
 *    `unknown factory: <name>`
 * ------------------------------------------------------------------ */
export class TestDataRegistry<T> {
  register(name: string, factory: () => T): void {
    throw new Error('not implemented: TestDataRegistry.register');
  }

  create(name: string): T {
    throw new Error('not implemented: TestDataRegistry.create');
  }

  has(name: string): boolean {
    throw new Error('not implemented: TestDataRegistry.has');
  }

  names(): string[] {
    throw new Error('not implemented: TestDataRegistry.names');
  }
}

/* ------------------------------------------------------------------ *
 * Task 5.5 - a default type parameter
 *
 * `ApiResponse` should carry the body type. Give `TBody` a default of
 * `unknown`, so `ApiResponse` on its own still means something - that is what
 * lets `isOk` accept any response without a type argument.
 *
 * Implement:
 *   ok(body)                -> { status: 200, body, headers: {} }
 *   isOk(response)          -> true for status 200-299
 *   expectStatus(res, code) -> returns res.body when the status matches,
 *                              otherwise throws Error with the message
 *                              `expected status <code>, got <actual>`
 *
 * `expectStatus` must return the body with its real type, not `unknown`.
 * That is what the type assertion at the bottom of this file checks.
 * ------------------------------------------------------------------ */
export interface ApiResponse<TBody> {
  status: number;
  body: TBody;
  headers: Record<string, string>;
}

export function ok<T>(body: T): ApiResponse<T> {
  throw new Error('not implemented: ok');
}

export function isOk(response: ApiResponse<unknown>): boolean {
  throw new Error('not implemented: isOk');
}

export function expectStatus<T>(response: ApiResponse<T>, status: number): T {
  throw new Error('not implemented: expectStatus');
}

// Graders for 5.5. Do not edit.
// The first one only compiles once `TBody` has a default.
type _DefaultBody = ApiResponse extends { body: infer B } ? B : never;
type _check_5_5_default = Expect<Equal<_DefaultBody, unknown>>;

export type _M05TypeChecks = [_check_5_5_default];
