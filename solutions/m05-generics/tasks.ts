/** Module 05 - reference solution. */

import type { Expect, Equal } from '../../src/_lib/type-assert';

/* --- 5.1 ---------------------------------------------------------- */
export function first<T>(items: T[]): T | undefined {
  return items[0];
}

export function last<T>(items: T[]): T | undefined {
  return items[items.length - 1];
}

export function compact<T>(items: (T | null | undefined)[]): T[] {
  // The predicate is a type predicate, which is what removes `null` and
  // `undefined` from the element type. A plain `item => item != null` would
  // filter correctly at runtime and still hand you `(T | null | undefined)[]`.
  return items.filter((item): item is T => item !== null && item !== undefined);
}

/* --- 5.2 ---------------------------------------------------------- */
export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

export function indexBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T> {
  const index = new Map<T[K], T>();
  for (const item of items) {
    // `set` overwrites, so the last item with a given key wins - which is
    // what the spec asks for. If you wanted first-wins you would guard with
    // `if (!index.has(...))`.
    index.set(item[key], item);
  }
  return index;
}

/* --- 5.3 ---------------------------------------------------------- *
 * The bug was `groups[key] = [item]`.
 *
 * That replaces the bucket on every iteration, so each key ends up holding
 * only the last item that landed in it. Read it out loud - "set the bucket to
 * an array containing this item" - and the bug names itself. Assignment where
 * you meant accumulation is one of the few bugs that survives code review,
 * because the line looks plausible in isolation.
 */
export function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  for (const item of items) {
    const key = keyFn(item);
    const bucket = groups[key];
    if (bucket === undefined) {
      groups[key] = [item];
    } else {
      bucket.push(item);
    }
  }

  return groups;
}

/*
 * Hardening note: if the keys come from user data, `Object.create(null)` or a
 * `Map` avoids the case where a key like '__proto__' or 'constructor' collides
 * with something on Object.prototype. For test fixtures a plain object is
 * fine; for anything parsing a payload, reach for `Map`.
 */

/* --- 5.4 ---------------------------------------------------------- */
export class TestDataRegistry<T> {
  // A Map iterates in insertion order, which `names()` relies on, and it
  // takes arbitrary string keys without any prototype surprises.
  private readonly factories = new Map<string, () => T>();

  register(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  create(name: string): T {
    const factory = this.factories.get(name);
    if (factory === undefined) {
      throw new Error(`unknown factory: ${name}`);
    }
    // Calling the factory (rather than storing an object) is what makes every
    // test get a fresh instance. Shared fixture objects are the second most
    // common cause of order-dependent test failures.
    return factory();
  }

  has(name: string): boolean {
    return this.factories.has(name);
  }

  names(): string[] {
    return [...this.factories.keys()];
  }
}

/* --- 5.5 ---------------------------------------------------------- */
export interface ApiResponse<TBody = unknown> {
  status: number;
  body: TBody;
  headers: Record<string, string>;
}

export function ok<T>(body: T): ApiResponse<T> {
  return { status: 200, body, headers: {} };
}

export function isOk(response: ApiResponse<unknown>): boolean {
  return response.status >= 200 && response.status < 300;
}

export function expectStatus<T>(response: ApiResponse<T>, status: number): T {
  if (response.status !== status) {
    throw new Error(`expected status ${status}, got ${response.status}`);
  }
  return response.body;
}

type _DefaultBody = ApiResponse extends { body: infer B } ? B : never;
type _check_5_5_default = Expect<Equal<_DefaultBody, unknown>>;

export type _M05TypeChecks = [_check_5_5_default];
