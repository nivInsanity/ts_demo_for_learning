# Module 08 · Errors, `unknown` in catch, and Result

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m08-errors`

## Why this module exists

A test that fails with `Error: Error` has told you nothing. A test that fails
with `HttpError: HTTP 503 for https://api/seed` caused by
`Error: ECONNREFUSED 127.0.0.1:5432` has told you where to look before you
opened a single file.

The difference is entirely in how errors are constructed, caught and
re-thrown. This module is about the three places people lose information:
generic errors, swallowed catches, and re-throws that drop the cause.

## Tasks

| # | Type | What |
|---|------|------|
| 8.1 | write | `TimeoutError`, `HttpError`, `ValidationError` |
| 8.2 | write | `toError` — normalise anything a catch gives you |
| 8.3 | **find the bug** | `withCleanup` — cleanup that never runs |
| 8.4 | types + write | `Result<T, E>` and friends |
| 8.5 | write | `error.cause` chains |

## `catch (error)` is `unknown`

```ts
try { ... } catch (error) {
  error.message   // compile error — `error` is `unknown`
}
```

This annoys people until they learn why: JavaScript lets you throw anything.
`throw 'nope'`, `throw 42`, `throw { code: 'E_NOPE' }` are all legal, and
real libraries do all three. TypeScript refuses to pretend otherwise.

The fix is not `catch (error: any)`. The fix is one `toError` helper, written
once, used everywhere — which is task 8.2.

## Custom errors: two rules

1. `super(message)` first, then `this.name = 'YourError'`. Skip the second
   line and your error prints as plain `Error` forever.
2. Put the *data* on the error, not just in the message. `error.status === 429`
   lets a retry helper make a decision; `error.message.includes('429')` is a
   thing you will regret.

## `error.cause`

```ts
throw new Error('could not seed database', { cause: original });
```

Standard since ES2022. It replaces every homegrown `originalError` /
`innerError` convention, and Node's stack printer understands it. The
anti-pattern it kills:

```ts
catch (e) { throw new Error(e.message); }   // stack gone, type gone, cause gone
```

## When to use `Result` instead of throwing

Throw for things the caller cannot reasonably handle. Return a `Result` when
failure is a normal branch the caller *must* deal with — parsing, validation,
a lookup that may legitimately miss. The discriminated union makes ignoring
the failure case a compile error, which is the entire benefit.

Do not rewrite a whole codebase in `Result` because it felt clever. Mixed
conventions inside one module cost more than either convention consistently
applied.

## Vocabulary

`Error subclass`, `parameter property`, `unknown in catch`, `error cause`,
`error chain`, `swallowing`, `finally`, `Result`/`Either`.
