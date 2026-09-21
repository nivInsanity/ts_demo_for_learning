/**
 * Compile-time assertion helpers.
 *
 * Some exercises in this repo are not about *behaviour* - they are about the
 * *type* you produced. A test that runs at runtime cannot see types, because
 * types are erased before the code executes. So we check those with the type
 * checker instead: `npm run typecheck`.
 *
 * You never need to edit this file. You only need to understand how it is used:
 *
 * ```ts
 * type _check = Expect<Equal<MyType, { id: number }>>;
 * ```
 *
 * If `MyType` is not exactly `{ id: number }`, `tsc` reports an error on that
 * line. If it is, the line is silently fine. That `_check` alias is never used
 * at runtime - it exists only to make the compiler do the assertion.
 */

/**
 * True if `A` and `B` are the *exact* same type.
 *
 * This is deliberately stricter than `A extends B`. `Equal` distinguishes
 * `any` from `unknown`, and `{ a: string }` from `{ a: string } | never`.
 * The two-function-signature trick below is the standard way to get the
 * compiler to compare types nominally rather than structurally.
 */
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** True if `A` and `B` differ. */
export type NotEqual<A, B> = Equal<A, B> extends true ? false : true;

/**
 * Fails to compile unless `T` is exactly `true`.
 * Use it to wrap an `Equal<...>` check.
 */
export type Expect<T extends true> = T;

/** Fails to compile unless `T` is exactly `false`. */
export type ExpectFalse<T extends false> = T;

/** True if `Sub` is assignable to `Super`. Looser than `Equal`. */
export type Extends<Sub, Super> = Sub extends Super ? true : false;
