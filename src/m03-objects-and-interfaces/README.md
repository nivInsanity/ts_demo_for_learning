# Module 03 · Objects, interfaces and structural typing

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Run** `npx vitest run src/m03-objects-and-interfaces`

## Why this module exists

TypeScript's type system is *structural*. It does not care what you named a
type — it cares what shape the value has. Two independently declared
interfaces with identical members are the same type as far as the compiler is
concerned. Coming from Java or C#, where types are *nominal*, this is the
single biggest adjustment.

Task 3.3 is the bug that produces "passes alone, fails in the suite". If you
learn only one thing from this module, learn that one.

## Tasks

| # | Type | What |
|---|------|------|
| 3.1 | types + write | `TestCase` interface, `formatTestCase` |
| 3.2 | write | `countByStatus` — `Record<K, V>` with all keys seeded |
| 3.3 | **find the bug** | `cloneConfig` — shallow copies that share state |
| 3.4 | types + write | `SuiteConfigOverride` by hand, `mergeConfig` |
| 3.5 | types + write | `ReporterOptions` and excess property checks |

### On `interface` vs `type`

Both work for object shapes. Practical rule: `interface` for object shapes
that something might extend, `type` for unions, tuples, function types and
anything computed. Do not spend an afternoon on it — no team has ever shipped
late because of this choice.

### On task 3.3

The fix is short. The understanding is not. `{ ...config }` copies *references*
for anything that is not a primitive. So the clone's `headers` and the
original's `headers` are the same object in memory, and a test that adds an
auth header to "its own copy" has just added it for the whole run.

In test code this shows up as order-dependent failures, which is the worst
class of bug to debug: the symptom is in a file you did not touch.

### On task 3.5 — excess property checks

Once `ReporterOptions` is a real interface, this errors:

```ts
createReporter({ outputDir: 'reports', opne: 'always' }); // typo caught
```

but this does not:

```ts
const options = { outputDir: 'reports', opne: 'always' };
createReporter(options); // no error — structurally compatible
```

That is not a bug in TypeScript. Excess property checking only applies to
*fresh object literals* assigned directly, as a typo-catching convenience.
Once the object has a name and a type of its own, structural typing takes
over: it has everything `ReporterOptions` needs, so it is acceptable. Knowing
exactly where that line falls will make you look unreasonably competent in a
code review.

## Vocabulary

`interface`, `readonly`, `optional property`, `index signature`,
`Record<K, V>`, `structural typing`, `excess property check`,
`shallow copy` vs `deep copy`.
