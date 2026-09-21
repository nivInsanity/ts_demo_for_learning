# After the last module

You have written, by hand, small versions of a schema validator, a retrying
HTTP client, a fixture system and a page object. Here is where each of those
leads.

## Turn the strictness up

Open `tsconfig.json`, set `noUncheckedIndexedAccess: true`, and run
`npm run typecheck`. Fix what breaks. It is the single best exercise left in
this repo, and it is free.

Then read [`docs/strictness.md`](strictness.md) for the rest of the flags.

## Add the tooling this repo deliberately skipped

```bash
npm i -D eslint typescript-eslint @eslint/js prettier
```

The rule worth having on day one is
`@typescript-eslint/no-floating-promises` — it catches an un-awaited promise,
which is module 07's entire bug class, statically. `no-misused-promises` is
the second one.

## Schema validation, for real

You built `objectOf` and `arrayOf` in module 13. The production versions:

- **zod** — the default choice; `z.infer<typeof schema>` is your `Infer`
- **valibot** — the same idea, much smaller bundle
- **typebox** — if you need JSON Schema output for contract testing

Read zod's source for `z.object`. It will look familiar now.

## Browser automation

**Playwright** is where most of this lands. The things you built map
directly:

| You wrote | Playwright calls it |
| --- | --- |
| `waitFor` | auto-waiting, `expect.poll`, `toPass` |
| `withFixture` | `test.extend` fixtures |
| `BasePage` | page objects (their docs' own recommendation) |
| `FakeTransport` | `page.route` / `browserContext.route` |
| `SoftAssert` | `expect.soft` |

Start with their "Writing tests" and "Page object models" guides. You will
mostly be learning an API, not a language, which is the position you wanted
to be in.

## API testing

**supertest** or plain `fetch` plus your module 13 client. **msw** for
intercepting requests in tests without a fake transport of your own.

## Things worth reading

- **TypeScript Handbook**, the "Everyday Types" and "Narrowing" chapters —
  short, and better than most tutorials
- **type-challenges** on GitHub — puzzles that pick up where module 10 left
  off; do the "easy" set, the rest is sport
- **Total TypeScript**'s free essentials tier, for structured drilling
- The `.d.ts` files in `node_modules/vitest` — real library types, readable
  now

## The habit worth keeping

Every time you hit a bug at work, ask whether a type could have caught it.
Often the answer is no — a wrong selector, a race in the app under test.
But often enough it is yes: a status string that should have been a union,
an optional field that was never optional, a `parseInt` eating a fraction.

Those are the ones worth writing down. That list, after a year, is worth
more than any course.
