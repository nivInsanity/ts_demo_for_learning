# Module 01 · Types and inference

> **Files** `tasks.ts` (edit this) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m01-types-and-inference` · `npm run typecheck`

## Why this module exists

TypeScript's whole value proposition is that it knows what your variables hold
*before* you run anything. For a QA engineer that matters more than for most
developers: a mistyped status string in a reporting helper does not crash, it
quietly produces a wrong report for six months.

Two ideas carry this module:

**Inference.** You rarely need to annotate everything. `const attempts = 3`
is already `3` — sorry, it is `number`, and that distinction is the subject of
task 1.5.

**Literal union types.** `string` accepts four billion values. `'pass' | 'fail'`
accepts two. Narrow types are how you turn a runtime bug into a compile error.

## What to read first

- [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [`as const`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)

## Tasks

| # | Type | What |
|---|------|------|
| 1.1 | write | `sanitizeTestName` — turn a test title into a slug |
| 1.2 | **find the bug** | `parseDurationMs` — it compiles and it lies |
| 1.3 | types + write | `Severity` union, `severityRank`, `isAtLeast` |
| 1.4 | write | `parseEnvLine` — return a tuple, not a loose array |
| 1.5 | type-level | freeze `RETRY_POLICY` with one keyword |

### On task 1.2

The failing test tells you the *symptom*. `parseDurationMs('1.5s')` returns
`1000` instead of `1500`. Your job is to name the *cause* in one sentence
before you touch the code. That habit is the entire difference between a
bug report that gets fixed and one that gets closed as "cannot reproduce".

### On task 1.3

After you replace `type Severity = string` with the union, one test starts
*passing* that was failing for a strange reason — the one with
`@ts-expect-error` in it. Read the comment there. An unused `@ts-expect-error`
is itself a compile error, which is how we write "this must not compile" as an
assertion.

### On task 1.5

`npm test` cannot grade this one. Types are erased when TypeScript becomes
JavaScript, so there is nothing left at runtime to assert against. Run
`npm run typecheck` and read the errors at the bottom of `tasks.ts`.

## Vocabulary you should own after this module

`inference`, `type annotation`, `literal type`, `union type`, `tuple`,
`widening`, `const assertion`, `structural typing` (preview — module 03).
