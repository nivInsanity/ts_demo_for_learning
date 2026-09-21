/** Module 10 - reference solution. */

import type { Expect, Equal } from '../../src/_lib/type-assert';

export interface TestRun {
  id: string;
  suite: string;
  startedAt: number;
  finishedAt: number;
  tags: string[];
}

/* --- 10.1 --------------------------------------------------------- */
export type TestRunPatch = Partial<TestRun>;
export type TestRunKey = Pick<TestRun, 'id' | 'suite'>;
export type TestRunWithoutTiming = Omit<TestRun, 'startedAt' | 'finishedAt'>;
export type FrozenTestRun = Readonly<TestRun>;

type _check_10_1_patch = Expect<
  Equal<
    TestRunPatch,
    { id?: string; suite?: string; startedAt?: number; finishedAt?: number; tags?: string[] }
  >
>;
type _check_10_1_key = Expect<Equal<TestRunKey, { id: string; suite: string }>>;
type _check_10_1_no_timing = Expect<
  Equal<TestRunWithoutTiming, { id: string; suite: string; tags: string[] }>
>;
type _check_10_1_frozen = Expect<
  Equal<
    FrozenTestRun,
    {
      readonly id: string;
      readonly suite: string;
      readonly startedAt: number;
      readonly finishedAt: number;
      readonly tags: string[];
    }
  >
>;

/* --- 10.2 --------------------------------------------------------- */
export const STATUS_COLORS = {
  passed: 'green',
  failed: 'red',
  skipped: 'grey',
  flaky: 'amber',
} as const;

// `typeof STATUS_COLORS` crosses from the value world to the type world.
// `keyof` then gives the union of keys, and `T[keyof T]` the union of values.
// Add a status to the object and both types widen on their own.
export type StatusName = keyof typeof STATUS_COLORS;
export type StatusColor = (typeof STATUS_COLORS)[StatusName];

export function colorFor(status: StatusName): StatusColor {
  return STATUS_COLORS[status];
}

export function statusNames(): StatusName[] {
  // `Object.keys` is typed as `string[]` - deliberately, because at runtime an
  // object may carry keys the type does not mention. Here we own the object
  // and it is `as const`, so the assertion is safe. Module 11 is about
  // knowing when an assertion is safe and when it is a lie.
  return Object.keys(STATUS_COLORS) as StatusName[];
}

type _check_10_2_name = Expect<Equal<StatusName, 'passed' | 'failed' | 'skipped' | 'flaky'>>;
type _check_10_2_color = Expect<Equal<StatusColor, 'green' | 'red' | 'grey' | 'amber'>>;

/* --- 10.3 --------------------------------------------------------- */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

// The recursion stops at anything that is not a plain object, which is what
// keeps `number[]` intact instead of turning it into a partial array-like.
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

type _check_10_3_nullable = Expect<
  Equal<Nullable<{ a: string; b: number }>, { a: string | null; b: number | null }>
>;
type _check_10_3_deep = Expect<
  Equal<
    DeepPartial<{ a: { b: string; c: number[] }; d: boolean }>,
    { a?: { b?: string; c?: number[] }; d?: boolean }
  >
>;

/* --- 10.4 --------------------------------------------------------- */
// `infer U` introduces a type variable that the compiler solves by matching.
// Read it as "if T looks like Promise<something>, call that something U".
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export type ElementType<T> = T extends readonly (infer U)[] ? U : never;
export type ResultOf<T> = T extends (...args: never[]) => infer R ? R : never;

type _check_10_4_a = Expect<Equal<UnwrapPromise<Promise<string>>, string>>;
type _check_10_4_b = Expect<Equal<UnwrapPromise<number>, number>>;
type _check_10_4_c = Expect<Equal<ElementType<string[]>, string>>;
type _check_10_4_d = Expect<Equal<ElementType<number>, never>>;
type _check_10_4_e = Expect<Equal<ResultOf<() => number>, number>>;
type _check_10_4_f = Expect<Equal<ResultOf<string>, never>>;

/* --- 10.5 --------------------------------------------------------- */
export type TestIdSelector<T extends string> = `[data-testid="${T}"]`;
export type HandlerName<T extends string> = `on${Capitalize<T>}`;

export function testId<T extends string>(id: T): TestIdSelector<T> {
  // The template literal on the value side produces a `string`, so the
  // assertion tells the compiler what we already guaranteed in the signature.
  return `[data-testid="${id}"]` as TestIdSelector<T>;
}

type _check_10_5_a = Expect<Equal<TestIdSelector<'cart'>, '[data-testid="cart"]'>>;
type _check_10_5_b = Expect<Equal<HandlerName<'click'>, 'onClick'>>;

export type _M10TypeChecks = [
  _check_10_1_patch,
  _check_10_1_key,
  _check_10_1_no_timing,
  _check_10_1_frozen,
  _check_10_2_name,
  _check_10_2_color,
  _check_10_3_nullable,
  _check_10_3_deep,
  _check_10_4_a,
  _check_10_4_b,
  _check_10_4_c,
  _check_10_4_d,
  _check_10_4_e,
  _check_10_4_f,
  _check_10_5_a,
  _check_10_5_b,
];
