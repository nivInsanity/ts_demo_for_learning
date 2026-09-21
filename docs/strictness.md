# The compiler flags, and why

`tsconfig.json` in this repo is deliberately strict but not sadistic. Here is
what each decision buys you, and what you should turn on once you are
comfortable.

## On by default here

### `strict: true`

An umbrella for about eight flags. The two that matter most:

- **`strictNullChecks`** — `string` no longer includes `null` and
  `undefined`. This one flag is most of TypeScript's value. Without it,
  `user.email.trim()` compiles even when `email` can be missing, which is the
  exact bug the type checker was supposed to prevent.
- **`noImplicitAny`** — a parameter with no annotation and no inferable type
  is an error instead of a silent `any`.

Never turn `strict` off. A codebase with `strict: false` is JavaScript with
extra ceremony.

### `noImplicitOverride: true`

You must write `override` when you replace a member the parent defines.
Without it, renaming a base-class method silently orphans every subclass
method that used to override it — they still compile, and they are now dead
code that nobody calls. Module 09 relies on this.

Implementing an `abstract` member does **not** need `override`, because there
was nothing there to override.

### `noFallthroughCasesInSwitch: true`

A `case` that falls through to the next one without `break` or `return` is an
error, unless it is empty (which is the intentional "these two cases share a
body" form used in module 04).

### `verbatimModuleSyntax` — not set

Left off so that `import { type Foo, bar }` and plain `import { Foo }` both
work while you are learning. Many real projects turn it on to make the
type-only imports explicit.

## Off here, worth turning on later

### `noUncheckedIndexedAccess`

```ts
const first = items[0];   // off: string      on: string | undefined
```

This is *correct* — `items[0]` on an empty array really is `undefined` — and
it is genuinely annoying, because every array access now needs a check or a
`!`. It is left off so module 01 is not a wall of null checks.

Turn it on after module 11. Expect to fix things for an hour, and expect to
find at least one real bug while you do.

### `exactOptionalPropertyTypes`

```ts
interface T { tags?: string[] }
const t: T = { tags: undefined };   // off: fine    on: error
```

It distinguishes "the property is absent" from "the property is present and
holds `undefined`". Useful when you serialise to JSON, where those two are
genuinely different. Noisy everywhere else.

### `noUnusedLocals` / `noUnusedParameters`

Off here, because half-finished exercise code is full of unused things and
that is not a mistake, it is a work in progress. Turn them on in a real
project — or better, let a linter handle it, so an unused variable is a
warning in your editor rather than a failed build.

## What this repo does not have

No ESLint, no Prettier. Both are excellent and both would have added a
hundred lines of config and a stream of formatting complaints on top of the
actual lessons. In a real project:

- **ESLint** with `typescript-eslint` catches what `tsc` will not:
  floating promises, `any` creeping in, unused disable comments.
  `@typescript-eslint/no-floating-promises` alone is worth the setup — it is
  the lint rule that catches module 07's entire class of bug.
- **Prettier** ends formatting arguments permanently.

Add them when you start your own repo, not while you are learning the
language.

## How to experiment

Change a flag in `tsconfig.json`, run `npm run typecheck`, and read what
breaks. That is a faster way to understand a compiler option than any
documentation page — including this one.
