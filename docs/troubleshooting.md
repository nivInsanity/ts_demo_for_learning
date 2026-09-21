# Troubleshooting

Error messages you will hit in this repo, and what they actually mean.

## `Object is possibly 'undefined'` / `'x' is possibly 'null'`

You are using a value the compiler cannot prove exists. Either check it:

```ts
if (owner !== undefined) owner.email;
owner?.email;
```

or, if you genuinely proved it two lines earlier and the compiler lost track,
restructure so the check and the use are in the same block. Reach for `!`
only when you can say out loud why it cannot be null — and then consider
writing that sentence as a comment.

## `Unused '@ts-expect-error' directive` (TS2578)

This is **the signal, not a problem**. `@ts-expect-error` asserts that the
next line does *not* compile. If your types are still too loose, the line
compiles fine, the directive has nothing to suppress, and you get this error.

Tighten the type the task asked you to tighten, and it goes away.

## `Type 'false' does not satisfy the constraint 'true'` (TS2344)

An `Expect<Equal<A, B>>` assertion failed: the two types are not identical.
The error points at the assertion, not at the mistake. Hover over your type
in the editor and compare it, member by member, against the expected shape on
the same line.

`Equal` is strict. `string` is not `'passed' | 'failed'`, `any` is not
`unknown`, and `{ a?: string }` is not `{ a: string | undefined }`.

## `Property 'x' does not exist on type 'never'`

A narrowing went too far: every member of the union has been excluded. Common
cause — a `switch` on a discriminant where you are inside the `default` and
already handled everything. That is `assertNever` territory, and the error
usually means the code is unreachable, which is what you wanted.

## `Argument of type 'X' is not assignable to parameter of type 'never'`

Usually an empty array whose type was never established:

```ts
const items = [];        // any[] — or never[] under some settings
items.push('a');         // complains
const items: string[] = [];   // fix
```

## A test hangs, or the run never exits

Module 07. Either a promise that nothing resolves, or a `setTimeout` you
never cleared. Vitest's `testTimeout` (10s here) will eventually fail the
test; a leaked timer instead keeps Node alive after the suite finishes.
`withTimeout` must `clearTimeout` on the success path.

## Tests pass alone, fail in the suite

Shared mutable state. Modules 03 and 12 are both about this. Look for:

- an object or array declared at module scope that something mutates
- `{ ...config }` where `config` has nested objects or arrays
- `Object.assign(DEFAULTS, overrides)`
- a fixture built once and reused instead of rebuilt per test

## `npm test` passes but `npm run typecheck` fails

Expected, and by design. Vitest transpiles without type checking — it strips
the types and runs the JavaScript. Several tasks are graded only by `tsc`.
Run both. `npm run check` runs them in order.

## The type error count went UP after I fixed something

Normal. Filling in a class constructor or tightening a union unlocks errors
that were previously hidden behind an earlier failure — the compiler could
not reach them before. The count drops in clumps, not one at a time.

## `npm run progress` shows a module with 0 tests

Its test file failed to import. Usually a syntax error in `tasks.ts`, or a
stub that throws at module scope rather than inside a function.
`PROGRESS.md` prints the first line of the failure under that module.

## I broke `tasks.test.ts`

```bash
git checkout -- src/<module>/tasks.test.ts
```

The test files are the specification. Restoring one is always the right move.

## My editor shows errors the terminal does not (or vice versa)

VS Code uses its own bundled TypeScript by default, which may be a different
version from the one in `node_modules`. `Cmd/Ctrl+Shift+P` →
"TypeScript: Select TypeScript Version" → "Use Workspace Version". The
terminal is always the source of truth.
