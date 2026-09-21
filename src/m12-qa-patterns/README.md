# Module 12 · Patterns you will actually write at work

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m12-qa-patterns`

## Why this module exists

Nothing here is TypeScript trivia. These four patterns show up in every
serious test codebase, whatever the framework, and each of them exists
because of a specific recurring pain:

- **builders** — because tests that spell out five irrelevant fields hide the
  one field they are about
- **shared mutable defaults** — because the "simple" version of a factory
  leaks state between tests, and that is the hardest class of bug to debug
- **fixtures** — because teardown that only runs on the happy path is worse
  than no teardown at all
- **soft assertions** — because diagnosing a form with four broken fields
  should take one run, not four

## Tasks

| # | Type | What |
|---|------|------|
| 12.1 | write | `UserBuilder` — fluent test data builder |
| 12.2 | **find the bug** | `makeUser` — a shared default that mutates |
| 12.3 | write | `withFixture` / `withFixtures` — guaranteed teardown |
| 12.4 | write | `SoftAssert` — collect, then report once |

## On task 12.1

```ts
// what a test should say
UserBuilder.aUser().asAdmin().build();

// not this
createUser({ id: 1, email: 'a@b.c', role: 'admin', active: true, tags: [] });
```

The second version forces the reader to diff five fields against the defaults
to work out what this test is about. Six months later nobody remembers
whether `active: true` mattered.

The detail that makes or breaks a builder is `[...this.#tags]` in `build()`.
Without it every user shares one array, and a test that pushes a tag onto
"its" user has quietly rewritten the fixture for everything that runs after
it.

## On task 12.2

`Object.assign(target, source)` writes into `target` and returns it. It is
not a copy. Every call mutates the module-level default, so:

- the second call inherits the first call's overrides
- `DEFAULT_USER` is a different object by the end of the suite
- test order determines the result

Test-order dependence is the worst bug class you will meet, because the
symptom appears in a file you did not touch and disappears when you run that
file alone.

## On task 12.3 — teardown order

Set up `a, b, c`; tear down `c, b, a`. Always. `c` may hold a handle that `b`
owns, and `b` may live in a database `a` created. Unwinding in the same
order you built is how you get "connection closed" during cleanup.

The other rule: **a cleanup failure must never hide a test failure**. If the
body threw and teardown also threw, the body's error is the one that gets
re-thrown. Anything else sends the whole team to read the wrong stack trace.

## On task 12.4 — a caution

Soft assertions are a diagnostic tool, not a default. A test with fifteen of
them is usually fifteen tests wearing a trench coat, and when it fails you
still have to read all fifteen lines to find out what it was checking. Use
them where one screen genuinely has several independent facts worth
reporting together.

## Vocabulary

`builder pattern`, `fluent interface`, `fixture`, `setup`/`teardown`,
`test isolation`, `order dependence`, `soft assertion`, `deep copy`.
