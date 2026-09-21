# Module 07 · Promises, async/await and time

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m07-async`

## Why this module exists

Every flaky test is an async bug wearing a costume. Waiting a fixed 3 seconds
and hoping, retrying without a bound, firing 500 requests at once because
`Promise.all` was right there — these are not edge cases, they are the daily
work.

By the end of this module you will have built, from scratch, the four
primitives that every test framework hides from you: a bounded wait, a retry
with backoff, a poll, and a concurrency limiter. After that, `page.waitFor…`
stops being magic.

## Tasks

| # | Type | What |
|---|------|------|
| 7.1 | write | `delay`, `withTimeout` |
| 7.2 | write | `retry` with exponential backoff |
| 7.3 | **find the bug** | `runAll` — `forEach` and `async` |
| 7.4 | write | `waitFor` — polling with a deadline |
| 7.5 | write | `mapWithConcurrency` — a worker pool |

## The rule that explains task 7.3

`await` suspends **the function it is written in**. Nothing else.

```ts
tasks.forEach(async (task) => {
  results.push(await task());   // suspends THIS callback
});
// ...and forEach has already returned, because it never looked at the
// promises the callbacks handed back.
```

`forEach`, `map`, `filter`, `find` and `sort` all ignore the return value of
an async callback (`map` at least hands you the promises, which is why
`await Promise.all(items.map(fn))` works). `for...of` is the only loop where
`await` does what it looks like it does.

## Sequential vs parallel vs bounded

```ts
for (const t of tasks) await t();          // one at a time, slow, gentle
await Promise.all(tasks.map(t => t()));    // all at once, fast, rude
await mapWithConcurrency(tasks, 5, t => t()); // five at a time
```

Choosing between these is a real engineering decision, not a style
preference. Against a shared staging environment, "all at once" is how you
become the person who broke staging.

## `Promise.all` vs `allSettled` vs `race` vs `any`

| | Resolves when | Rejects when |
|---|---|---|
| `all` | every promise resolves | the **first** rejection |
| `allSettled` | every promise settles | never |
| `race` | the first promise **settles** | the first promise settles, if it rejected |
| `any` | the first promise resolves | all of them reject |

`allSettled` is the one QA people underuse. "Run all 40 checks and tell me
everything that failed" is `allSettled`, not `all`.

## Timers leak

`setTimeout` keeps the Node process alive until it fires. A `withTimeout`
that does not `clearTimeout` on the happy path leaves one timer per call
hanging around, and your CI job sits at "Tests passed" for thirty seconds
before exiting. Task 7.1 tests for it.

## Vocabulary

`Promise`, `async`/`await`, `microtask`, `event loop`, `Promise.race`,
`Promise.allSettled`, `backoff`, `polling`, `deadline`, `bounded concurrency`,
`unhandled rejection`.
