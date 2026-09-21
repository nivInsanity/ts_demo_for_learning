# Module 13 · Capstone — a typed API testing toolkit

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Helper** `src/_lib/fake-transport.ts` — a scriptable HTTP layer
> **Run** `npx vitest run src/m13-capstone` · `npm run typecheck`

## What you are building

Three layers, each one using everything below it:

```
UsersApi          typed methods a test author calls
   |
ApiClient         retries transient failures, validates the body,
   |              throws errors you can branch on
Transport         sends a request, returns a response (injected, fake in tests)
```

plus a small schema library — `str`, `num`, `arrayOf`, `objectOf`,
`optional`, `oneOf` — that produces both the runtime check *and* the
TypeScript type from one declaration.

This is deliberately harder than the other modules. It is also the closest
thing here to code you could put in a real repository on Monday.

## Tasks

| # | What | Pulls in |
|---|------|----------|
| 13.1 | Schema validators and combinators | modules 04, 05, 08, 10, 11 |
| 13.2 | `ApiClient` — retry, error mapping, validation | modules 07, 08, 09 |
| 13.3 | `userSchema`, `UsersApi`, `CreateUserInput` | modules 05, 10, 12 |

## Suggested order

1. `typeName` first — a helper that turns any value into `'string'`,
   `'null'`, `'array'`, and so on. Everything else formats errors with it.
2. `str`, `num`, `bool`. Get one error message exactly right and the rest
   are copy-paste.
3. `arrayOf`, then `objectOf`. Both collect *all* errors rather than
   returning on the first — that is what makes the output useful.
4. `optional` and `oneOf`.
5. `ApiClient`. Write the retry loop before the error mapping.
6. `userSchema` and `UsersApi` last; by then they are ten lines.

## The two type-level tricks

**`Infer<V>`** is given to you:

```ts
export type Infer<V> = V extends Validator<infer T> ? T : never;
```

It is the conditional type from module 10, doing a real job: pulling the
validated type back out of a validator so you never declare the same shape
twice.

**`const` type parameters** keep `oneOf(['admin', 'user'])` as
`readonly ['admin', 'user']` instead of widening it to `string[]`:

```ts
export function oneOf<const T extends readonly string[]>(values: T): Validator<T[number]>
```

Without the `const` modifier the caller would need `as const` at every call
site.

## Two decisions worth arguing about

**Status is checked before the schema.** A 500 that returns an HTML error
page should be reported as a 500, not as "expected object, got string".

**A schema failure is not retried.** A wrong shape on a 200 is a contract
change. Hammering the endpoint twice more does not fix it, it just triples
how long it takes to find out.

If you disagree with either, that is a legitimate design conversation — have
it with your team and write the decision down in a test.

## What this maps onto

| You wrote | The real thing |
|---|---|
| `str` / `objectOf` / `arrayOf` | zod, valibot, typebox |
| `ApiClient.request` | the retry-and-validate layer every API suite grows |
| `UsersApi` | a page object, for an API instead of a page |
| `FakeTransport` | msw, nock, or a Playwright route handler |

The point is not to ship this instead of zod. It is that you now know what
those libraries do and which failure modes they remove — so you can read
their errors instead of guessing.

## When this is green

You have written, by hand, a small version of most of a modern TypeScript
test stack. Go and read the source of a library you use. It will look like
code now.
