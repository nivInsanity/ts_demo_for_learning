# TypeScript for QA Automation

A hands-on TypeScript course disguised as a repository. Thirteen modules,
about seventy tasks, three hundred and forty-nine tests. You fix broken code,
write functions from a spec, and make the type checker stop shouting.

Nothing here is a tutorial you read. Everything here is a test you turn green.

[![CI](https://github.com/nivInsanity/ts_demo_for_learning/actions/workflows/ci.yml/badge.svg)](https://github.com/nivInsanity/ts_demo_for_learning/actions/workflows/ci.yml)

---

## Who this is for

Someone who already tests software — manually, or with Python, Java or C# —
and now needs TypeScript, because that is what Playwright, Cypress, Vitest
and Jest are written in.

It assumes you can program. It does not assume you know JavaScript. Every
example is a test-automation problem: parsing durations, retrying a flaky
call, diffing two runs, validating an API response, building a page object.

## Quick start

```bash
npm install
npm test          # everything fails — that is the starting line
npm run progress  # see where you are
```

Then open [`src/m01-types-and-inference/README.md`](src/m01-types-and-inference/README.md)
and start.

> If this folder is not a git repository yet, or the CI workflow is missing,
> see [`SETUP.md`](SETUP.md) — two commands, one minute.

Requires Node 20 or newer. No browsers, no database, no API keys — the whole
thing runs offline.

## The loop

1. Read the module's `README.md`. It explains the idea and lists the tasks.
2. Open `tasks.ts` in that folder. That is the only file you edit.
3. Run the watcher and work until it is green:

   ```bash
   npx vitest src/m04-narrowing-and-guards
   ```

4. Run `npm run typecheck`. Some tasks are graded only by the compiler.
5. `npm run progress` to see the needle move.
6. Only then, read `solutions/<module>/tasks.ts`. The comments there explain
   *why*, not just *what* — that is where a lot of the value is.

`tasks.test.ts` is the specification. Do not edit it. If you are convinced a
test is wrong, say so — arguing with a spec is a real QA skill, and one of
them is in fact deliberately picky.

## How you see progress

Three independent gates, because "did it work" has three different meanings
in a typed language:

| Command | Gate | Catches |
| --- | --- | --- |
| `npm test` | runtime behaviour | wrong output, crashes, mutation bugs |
| `npm run typecheck` | the type system | loose types, missing narrowing, bad generics |
| `npm run progress` | the dashboard | where you are, what is next |

`npm run progress` prints a table and rewrites [`PROGRESS.md`](PROGRESS.md),
which renders as a checklist on GitHub:

```
  Module                    Progress           Tests      Types
  ────────────────────────────────────────────────────────────────
  01 types-and-inference    ████████████ 100%  24/24      ok ✓
  02 functions              █████░░░░░░░  43%  12/28      2 errors
  ...
  TOTAL                     ███░░░░░░░░░  31%  109/349    41 errors

  Next up  →  m02-functions  ·  2.1 buildUrl (5 failing)
```

Commit `PROGRESS.md` as you go and your git history becomes a learning log.
GitHub Actions runs the same three commands on every push, so the badge
above and the CI log tell the same story.

> **Why so many type errors at the start?** Several tasks ask you to replace
> a deliberately loose type, and a single missing class constructor can
> produce a dozen downstream complaints. The count drops in clumps, not one
> at a time. Chase the tests first; the type errors mostly fall out with them.

## Curriculum

| # | Module | You will learn | Bug hunts |
| --- | --- | --- | :-: |
| 01 | [Types and inference](src/m01-types-and-inference/) | literal unions, tuples, inference, `as const` | 1 |
| 02 | [Functions](src/m02-functions/) | optional & rest params, overloads, closures, `??` vs `\|\|` | 1 |
| 03 | [Objects and interfaces](src/m03-objects-and-interfaces/) | `readonly`, index signatures, structural typing, excess property checks | 1 |
| 04 | [Narrowing and guards](src/m04-narrowing-and-guards/) | discriminated unions, `never`, type predicates, assertion functions | 1 |
| 05 | [Generics](src/m05-generics/) | constraints, `keyof`, indexed access, generic classes | 1 |
| 06 | [Collections](src/m06-collections/) | map/filter/reduce, stable sorts, mutation, `Set`, `Map` | 2 |
| 07 | [Async](src/m07-async/) | timeouts, retry with backoff, polling, bounded concurrency | 1 |
| 08 | [Errors](src/m08-errors/) | custom errors, `unknown` in catch, `error.cause`, `Result` | 1 |
| 09 | [Classes](src/m09-classes/) | `abstract`, `override`, `#private`, lost `this`, DI | 1 |
| 10 | [Utility types](src/m10-utility-types/) | `Partial`/`Pick`/`Omit`, mapped & conditional types, `infer` | — |
| 11 | [Type safety](src/m11-type-safety/) | `unknown` vs `any`, assertions that lie, `satisfies`, validators | 1 |
| 12 | [QA patterns](src/m12-qa-patterns/) | builders, fixtures with real teardown, soft assertions | 1 |
| 13 | [Capstone](src/m13-capstone/) | a schema library, a retrying API client, a typed API surface | — |

Twelve of those "find the bug" tasks are real bugs — code that compiles,
passes a casual read, and is wrong. Most of them have shipped to production
somewhere. Learning to name the cause in one sentence before touching the
code is half the point of the exercise.

## Layout

```
src/
  _lib/                     shared helpers — you never edit these
    type-assert.ts            Expect<Equal<A, B>> for compile-time assertions
    fake-driver.ts            a 60-line stand-in for a browser driver
    fake-transport.ts         a scriptable HTTP layer
  m01-types-and-inference/
    README.md                 the lesson and the task list
    tasks.ts                  ← you edit this
    tasks.test.ts             the specification — do not edit
  ...
solutions/                  reference answers, heavily commented
scripts/
  progress.ts               the dashboard
  verify-solutions.ts       proves the solutions satisfy the tests
docs/                       setup, workflow, cheat sheet, strictness
```

## Commands

| Command | What it does |
| --- | --- |
| `npm test` | run everything once |
| `npm run test:watch` | re-run on save — the one you will live in |
| `npx vitest src/m05-generics` | one module, watching |
| `npm run typecheck` | `tsc --noEmit`, the second grader |
| `npm run check` | typecheck then tests |
| `npm run progress` | the table, and rewrite `PROGRESS.md` |
| `npm run solutions:verify` | maintainer check: do the reference answers pass? |
| `npm run audit` | maintainer check: is the repo itself internally consistent? |

## About the solutions

They are in the repo on purpose. Hiding them would only mean you look up a
worse answer somewhere else.

They are also worth reading *after* you are green, even when your version
works — the comments explain why `parseInt` ate your fraction, why `sort`
returns the array it just mutated, and why `forEach` ignores `await`. Those
paragraphs are the part you cannot get from the test passing.

## Suggested pace

Modules 01–06 are the language. 07–09 are the things that make test suites
flaky. 10–13 are what separates someone who writes TypeScript from someone
who reads it.

An evening per module is a sane pace; module 07 and module 13 will take
longer. Doing it in one weekend is possible and not recommended — the bug
hunts are worth sitting with.

## Licence

MIT. Fork it, rip it apart, use it to onboard someone.
