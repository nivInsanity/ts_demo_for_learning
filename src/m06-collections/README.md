# Module 06 · Arrays, Maps and Sets

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m06-collections`

## Why this module exists

A raw test run is a few thousand objects. Everything anyone wants from it —
pass rate, the ten slowest tests, what changed since yesterday — is a
reshaping of that array. Doing it well is unglamorous and constantly useful.

Task 6.3 contains the two array bugs most likely to bite you. Both are
correct for small, tidy inputs, which is exactly why they survive review.

## Tasks

| # | Type | What |
|---|------|------|
| 6.1 | write | `uniqueBy`, `partition` |
| 6.2 | write | `sortBy` — multiple keys, stable, non-mutating |
| 6.3 | **find two bugs** | `slowestTests`, `medianDuration` |
| 6.4 | write | `summarize` — the numbers that go in Slack |
| 6.5 | write | `diffSuites` — Sets instead of nested loops |

## Mutating vs non-mutating

Burn this table into your memory. The left column changes the array you were
given; the right column gives you a new one.

| Mutates | Returns a copy |
|---|---|
| `sort`, `reverse`, `splice` | `map`, `filter`, `slice`, `concat`, `flatMap` |
| `push`, `pop`, `shift`, `unshift` | `toSorted`, `toReversed`, `toSpliced`, `with` |

`sort` is the dangerous one because it *also returns the array*, so
`const sorted = results.sort(...)` looks like it made a copy. It did not.
`results` and `sorted` are the same array.

Modern runtimes have `toSorted()`, which is `sort` without the mutation. If
your Node version supports it, prefer it. `[...items].sort()` works
everywhere and is what the reference solution uses.

## `.sort()` with no comparator

```ts
[1, 2, 10].sort()        // [1, 10, 2]  — every element is stringified first
[1, 2, 10].sort((a, b) => a - b)  // [1, 2, 10]
```

This is not a quirk, it is the specified behaviour: the default comparator
compares UTF-16 code units. Numbers always need an explicit comparator.

## On pass rate

Task 6.4 asks you to exclude skipped tests from the denominator. That is a
*product* decision embedded in a *function*, and it is the kind of thing a QA
engineer should have an opinion about. A suite reported as "60% passing"
where 40% were skipped tells a very different story from one where 40%
genuinely failed. Whatever your team decides, decide it explicitly and write
it in a test.

## Vocabulary

`map`, `filter`, `reduce`, `flatMap`, `in-place mutation`, `stable sort`,
`comparator`, `Set`, `Map`, `tuple return`.
