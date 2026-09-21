# Module 05 · Generics

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m05-generics` · `npm run typecheck`

## Why this module exists

Generics have a reputation for being advanced. They are not — they are the
thing you are already doing every time you write `string[]`. A generic is a
parameter that happens to be a type instead of a value.

For a QA engineer they matter because *every* useful test helper is generic.
A fixture factory, a page-object base class, a response wrapper, a polling
helper — each one has to work for many types while preserving the specific
one the caller passed in. Without generics your helper returns `any` and the
type checker stops helping you exactly where you most need it.

## Tasks

| # | Type | What |
|---|------|------|
| 5.1 | write | `first`, `last`, `compact` |
| 5.2 | types + write | `pluck`, `indexBy` — `K extends keyof T` |
| 5.3 | **find the bug** | `groupBy` throws away data |
| 5.4 | write | `TestDataRegistry<T>` — a generic class |
| 5.5 | types + write | `ApiResponse<TBody = unknown>` — default type parameters |

## The three moves you need

**A plain type parameter.** `function first<T>(items: T[]): T | undefined`.
The caller never writes `first<number>([1,2,3])` — TypeScript infers `T` from
the argument. That inference is the whole ergonomic win.

**A constraint.** `K extends keyof T` means "K must be one of T's property
names". Without it, `pluck(users, 'nmae')` compiles. With it, the typo is a
compile error and the return type is computed for you.

**An indexed access type.** `T[K]` is "the type of T's property named K". For
`User` and `'name'` that is `string`. This is how `pluck` returns `string[]`
rather than `any[]`.

## A rule of thumb

If a type parameter appears only once in a signature, you probably did not
need a generic:

```ts
function log<T>(value: T): void      // pointless — `value: unknown` says the same
function first<T>(items: T[]): T     // useful — T links input to output
```

Generics earn their keep by connecting two places in a signature.

## `any` is not a generic

```ts
function pluck(items: any[], key: string): any[]
```

This compiles for every call, catches no mistakes, and infects everything
downstream with `any`. It is the single most common way a TypeScript codebase
quietly reverts to JavaScript. Task 5.2 is about feeling the difference.

## Vocabulary

`type parameter`, `type argument`, `inference`, `constraint`,
`keyof`, `indexed access type`, `default type parameter`, `generic class`.
