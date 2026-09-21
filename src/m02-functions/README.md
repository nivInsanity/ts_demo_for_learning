# Module 02 · Functions

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m02-functions`

## Why this module exists

Test code is mostly functions that build other functions: fixtures, matchers,
validators, page-object factories. If you are comfortable with optional
parameters, rest parameters, overloads and functions-as-values, you can read
almost any test framework's source. If you are not, every framework looks like
magic.

This module also contains the single most common JavaScript bug in
configuration code. It is task 2.3 and you will meet it again at work.

## Tasks

| # | Type | What |
|---|------|------|
| 2.1 | write | `buildUrl` — optional params, deterministic query strings |
| 2.2 | write | `joinPaths` — rest parameters |
| 2.3 | **find the bug** | `resolveRunOptions` — defaults that eat your input |
| 2.4 | write + types | `range` — function overloads |
| 2.5 | write | `Validator` — functions that return functions |

### On task 2.3

Reproduce it before you fix it. Write down, in one line, what the caller asked
for and what they got. Then find the operator responsible. The fix is two
characters, repeated four times — the value is in being able to name *why*.

### On task 2.4

Overload signatures are a list of the call shapes you allow. The
implementation signature underneath is invisible to callers:

```ts
export function f(a: string): string;
export function f(a: number): number;
export function f(a: string | number): string | number { /* ... */ }
//     ^ callers never see this one, so it may be as loose as it needs to be
```

Two tests use `@ts-expect-error`. They currently fail to compile because
there is nothing to error about — the starter signature accepts anything.
Once your overloads are in place they go quiet.

### On task 2.5

`required('username')` does not validate anything. It *returns* something
that validates. Getting comfortable with that indirection is the point;
`beforeEach`, `test.each`, and every fixture system you will ever use is
built out of it.

## Vocabulary

`optional parameter`, `default parameter`, `rest parameter`, `overload
signature`, `implementation signature`, `higher-order function`, `closure`,
`nullish coalescing`.
