# Module 04 · Unions, narrowing and type guards

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m04-narrowing-and-guards` · `npm run typecheck`

## Why this module exists

This is the module. If you skip one, do not let it be this one.

Every API response you assert against, every step result you report on, every
`unknown` that comes back from `JSON.parse` — all of it arrives as a value
that could be several things, and your job is to prove which one it is before
you touch it. TypeScript calls that **narrowing**, and it is what the language
is actually for.

The alternative is one fat interface where half the fields are optional, and
a codebase full of `result.error!` non-null assertions. You have seen that
codebase. It has a lot of `Cannot read property of undefined` in its logs.

## Tasks

| # | Type | What |
|---|------|------|
| 4.1 | types + write | `StepResult` discriminated union, `formatStep` |
| 4.2 | write | `assertNever`, `exitCodeFor` — exhaustive switches |
| 4.3 | types + write | `isFailed` as a type predicate |
| 4.4 | **find the bug** | `describeValue` — a quirk from 1995 |
| 4.5 | types + write | `assertIsString` — assertion functions |

## The four ways to narrow

```ts
typeof value === 'string'        // typeof guard, for primitives
value instanceof TimeoutError    // instanceof guard, for classes
'error' in step                  // the `in` operator, for object shapes
step.kind === 'failed'           // a discriminant — the one you want
```

Discriminated unions are the one you want because they scale. A shared
literal-typed property (`kind`, `type`, `status` — the name does not matter)
lets the compiler pick the right member from a `switch` and gives you
exhaustiveness checking for free.

## Exhaustiveness, and why `never` is useful

`never` is the type with no values. Nothing is assignable to it. So:

```ts
default:
  return assertNever(step);
```

compiles only when `step` has been narrowed to `never` — which happens only
when every member of the union is already handled above. Add a fourth member
to `StepResult` six months from now, and every switch that forgot about it
becomes a compile error. This is the single highest-value pattern in the
language and it costs four lines.

## Type predicates vs assertion functions

```ts
function isFailed(s: StepResult): s is FailedStep   // returns a boolean, narrows in an if
function assertIsString(v: unknown): asserts v is string  // throws, narrows afterwards
```

Both are *promises you make to the compiler*. It does not verify the body.
`return step.kind === 'passed'` inside `isFailed` would compile happily and
poison everything downstream. Keep them tiny.

## Vocabulary

`union`, `discriminated union`, `discriminant`, `narrowing`, `control flow
analysis`, `type predicate`, `assertion function`, `exhaustiveness check`,
`never`.
