/**
 * Module 10 - Utility types, mapped types, conditional types
 *
 * Read src/m10-utility-types/README.md first.
 *
 * This module is graded mostly by `npm run typecheck`. Several tasks have
 * nothing to execute - the deliverable IS a type. Run:
 *
 *   npm run typecheck
 *
 * and work until the errors in this file are gone.
 */

import type { Expect, Equal } from '../_lib/type-assert';

export interface TestRun {
  id: string;
  suite: string;
  startedAt: number;
  finishedAt: number;
  tags: string[];
}

/* ------------------------------------------------------------------ *
 * Task 10.1 - the built-in utility types
 *
 * Derive four types from `TestRun`. Use the built-ins - `Partial`, `Pick`,
 * `Omit`, `Readonly`. Writing the shapes out by hand would satisfy the
 * grader and defeat the point: a derived type follows `TestRun` when it
 * changes, a copied one silently drifts.
 *
 *   TestRunPatch          every property optional
 *   TestRunKey            only `id` and `suite`
 *   TestRunWithoutTiming  everything except `startedAt` and `finishedAt`
 *   FrozenTestRun         every property readonly
 * ------------------------------------------------------------------ */
export type TestRunPatch = never; // TODO
export type TestRunKey = never; // TODO
export type TestRunWithoutTiming = never; // TODO
export type FrozenTestRun = never; // TODO

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

/* ------------------------------------------------------------------ *
 * Task 10.2 - keyof, typeof and indexed access
 *
 * `STATUS_COLORS` is the single source of truth. Derive the types from the
 * VALUE rather than declaring them separately, so adding a status to the
 * object automatically widens the types.
 *
 *   StatusName  -> 'passed' | 'failed' | 'skipped' | 'flaky'
 *   StatusColor -> 'green' | 'red' | 'grey' | 'amber'
 *
 * Hints: `typeof STATUS_COLORS` is the type of the value. `keyof X` is the
 * union of its keys. `X[keyof X]` is the union of its value types.
 *
 * Then implement `colorFor`, and `statusNames()` which returns the keys.
 * ------------------------------------------------------------------ */
export const STATUS_COLORS = {
  passed: 'green',
  failed: 'red',
  skipped: 'grey',
  flaky: 'amber',
} as const;

export type StatusName = string; // TODO: derive from STATUS_COLORS
export type StatusColor = string; // TODO: derive from STATUS_COLORS

export function colorFor(status: StatusName): StatusColor {
  throw new Error('not implemented: colorFor');
}

export function statusNames(): StatusName[] {
  throw new Error('not implemented: statusNames');
}

type _check_10_2_name = Expect<Equal<StatusName, 'passed' | 'failed' | 'skipped' | 'flaky'>>;
type _check_10_2_color = Expect<Equal<StatusColor, 'green' | 'red' | 'grey' | 'amber'>>;

/* ------------------------------------------------------------------ *
 * Task 10.3 - mapped types
 *
 * Write two of your own.
 *
 *   Nullable<T>    every property may also be null
 *                    Nullable<{ a: string }> -> { a: string | null }
 *
 *   DeepPartial<T> every property optional, recursively, but arrays and
 *                  primitives are left alone
 *                    DeepPartial<{ a: { b: string } }> -> { a?: { b?: string } }
 *
 * The syntax is `{ [K in keyof T]: ... }`. For DeepPartial you need the
 * optional modifier `?` and a recursive call on object-valued properties.
 * ------------------------------------------------------------------ */
export type Nullable<T> = T; // TODO
export type DeepPartial<T> = T; // TODO

type _check_10_3_nullable = Expect<
  Equal<Nullable<{ a: string; b: number }>, { a: string | null; b: number | null }>
>;
type _check_10_3_deep = Expect<
  Equal<
    DeepPartial<{ a: { b: string; c: number[] }; d: boolean }>,
    { a?: { b?: string; c?: number[] }; d?: boolean }
  >
>;

/* ------------------------------------------------------------------ *
 * Task 10.4 - conditional types and `infer`
 *
 *   UnwrapPromise<Promise<string>>  -> string
 *   UnwrapPromise<string>           -> string     (left alone)
 *
 *   ElementType<string[]>           -> string
 *   ElementType<number>             -> never
 *
 *   ResultOf<() => number>          -> number     (your own ReturnType)
 *   ResultOf<string>                -> never
 *
 * The shape is `T extends SomePattern ? A : B`, and `infer U` inside the
 * pattern gives you a name for whatever matched.
 * ------------------------------------------------------------------ */
export type UnwrapPromise<T> = T; // TODO
export type ElementType<T> = T; // TODO
export type ResultOf<T> = T; // TODO

type _check_10_4_a = Expect<Equal<UnwrapPromise<Promise<string>>, string>>;
type _check_10_4_b = Expect<Equal<UnwrapPromise<number>, number>>;
type _check_10_4_c = Expect<Equal<ElementType<string[]>, string>>;
type _check_10_4_d = Expect<Equal<ElementType<number>, never>>;
type _check_10_4_e = Expect<Equal<ResultOf<() => number>, number>>;
type _check_10_4_f = Expect<Equal<ResultOf<string>, never>>;

/* ------------------------------------------------------------------ *
 * Task 10.5 - template literal types
 *
 * Types can be built from string patterns. This is how a modern test
 * framework knows that `page.getByTestId('cart')` relates to the selector
 * `[data-testid="cart"]` without you writing either string twice.
 *
 *   TestIdSelector<'cart'>  -> '[data-testid="cart"]'
 *   HandlerName<'click'>    -> 'onClick'   (note the capital C)
 *
 * Then implement `testId`, whose return type must be the specific literal,
 * not plain `string`.
 * ------------------------------------------------------------------ */
export type TestIdSelector<T extends string> = string; // TODO
export type HandlerName<T extends string> = string; // TODO

export function testId<T extends string>(id: T): TestIdSelector<T> {
  throw new Error('not implemented: testId');
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
