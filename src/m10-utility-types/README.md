# Module 10 · Utility, mapped and conditional types

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Graded mostly by** `npm run typecheck`

## Why this module exists

Up to now you have written types by describing them. This module is about
*deriving* them — computing one type from another so the two cannot drift
apart.

That matters most in test code, where the same shape shows up in a fixture
factory, a request builder, an assertion helper and a reporter. Write it four
times and the fourth one is wrong within a month. Derive it and adding a
field to the source updates all four, or breaks the build loudly.

## Tasks

| # | What | Graded by |
|---|------|-----------|
| 10.1 | `Partial`, `Pick`, `Omit`, `Readonly` | typecheck |
| 10.2 | `keyof`, `typeof`, indexed access | typecheck + tests |
| 10.3 | Your own `Nullable<T>` and `DeepPartial<T>` | typecheck |
| 10.4 | Conditional types and `infer` | typecheck |
| 10.5 | Template literal types | typecheck + tests |

## The built-ins worth memorising

| Type | Means |
|---|---|
| `Partial<T>` | every property optional |
| `Required<T>` | every property mandatory |
| `Readonly<T>` | every property readonly |
| `Pick<T, K>` | only these properties |
| `Omit<T, K>` | everything except these |
| `Record<K, V>` | an object with keys K and values V |
| `Exclude<U, X>` | remove members from a union |
| `Extract<U, X>` | keep only members matching |
| `NonNullable<T>` | drop `null` and `undefined` |
| `ReturnType<F>` | what a function returns |
| `Parameters<F>` | a function's parameters, as a tuple |
| `Awaited<T>` | what a promise resolves to |

`Extract<StepResult, { kind: 'failed' }>` is the one-liner you wrote by hand
in module 04.

## `keyof typeof` — value world to type world

```ts
const STATUS_COLORS = { passed: 'green', failed: 'red' } as const;

type StatusName  = keyof typeof STATUS_COLORS;              // 'passed' | 'failed'
type StatusColor = (typeof STATUS_COLORS)[StatusName];      // 'green' | 'red'
```

`typeof` in a *type* position asks "what is the type of that value". This is
the bridge between a constant you can iterate at runtime and a union you can
check at compile time — one source of truth for both.

## Mapped types

```ts
type Nullable<T> = { [K in keyof T]: T[K] | null };
```

Read it as a for-loop over the keys. The modifiers `?` and `readonly` can be
added (`+?`) or removed (`-?`) as you map.

## Conditional types and `infer`

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
```

`infer U` means "match this position and call whatever is there U". It is
pattern matching for types. You will not write these daily, but reading them
is the difference between understanding a library's type error and guessing.

## A warning

Everything in this module is fun, and that is the danger. Type-level
programming can absorb an entire afternoon producing something nobody can
maintain. The test: could a colleague read it in thirty seconds? If not, a
plain interface and a comment usually win.

## Vocabulary

`utility type`, `mapped type`, `conditional type`, `infer`, `keyof`,
`typeof` (type position), `indexed access`, `template literal type`,
`Capitalize`, `distributive conditional type`.
