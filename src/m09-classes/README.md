# Module 09 · Classes, inheritance and composition

> **Files** `tasks.ts` (edit) · `tasks.test.ts` (do not edit)
> **Helper** `src/_lib/fake-driver.ts` — a 60-line stand-in for a browser
> **Run** `npx vitest run src/m09-classes`

## Why this module exists

Page objects, fixtures, custom reporters and API clients are all classes.
If you have a Java or C# background most of this will look familiar — which
is the trap, because three things do not behave the way you expect:

- `this` can be *lost*, and the compiler will not warn you (task 9.3)
- `private` is erased at compile time; `#private` is not (task 9.4)
- returning `this` and returning the class name are different types (9.1)

## Tasks

| # | Type | What |
|---|------|------|
| 9.1 | write | `BasePage` abstract + `LoginPage` |
| 9.2 | write | `AdminLoginPage` — `override` and `super` |
| 9.3 | **find the bug** | `countRetries` — a lost `this` |
| 9.4 | write | `StepRecorder` — `#private`, static factory, fluent API |
| 9.5 | write | `SuiteRunner` — composition and dependency injection |

## Parameter properties

```ts
constructor(protected readonly driver: Driver, private readonly baseUrl: string) {}
```

The modifier in the parameter list declares the field and assigns it. It is
TypeScript-only sugar, it saves six lines per class, and it is used
everywhere in real code.

## Access modifiers, honestly

| | Visible to | Survives compilation |
|---|---|---|
| `public` (default) | everyone | — |
| `protected` | the class and its subclasses | no |
| `private` | the class only | **no** |
| `#field` | the class only | **yes** |

`private` is a promise between you and the type checker. At runtime the
property is a normal property and `obj['secret']` reads it. `#field` is a
real JavaScript private — inaccessible from outside, full stop. Use `#` when
you genuinely need encapsulation, `private` when you are documenting intent.

## `this` is decided at the call site

```ts
const increment = counter.increment;  // just the function, no owner
increment();                          // `this` is undefined → TypeError
```

This is not a TypeScript wart, it is how JavaScript has always worked. The
method does not remember the object it was reached through. Fixes:
`.bind(obj)`, an arrow wrapper `() => obj.method()`, or an arrow class field.

## Composition over inheritance

Task 9.5 injects a `Logger` and a `Clock` rather than calling `console.log`
and `Date.now()` directly. That single decision is what makes the duration
assertable as exactly `250`, instead of "a number, probably".

Deep page-object hierarchies are the classic QA version of this mistake.
Three levels of `BasePage → AuthenticatedPage → AdminPage → UsersPage` and
nobody can tell you where `waitForLoad` is defined. Prefer small classes that
*hold* a driver and a few helpers over tall trees that inherit them.

## Vocabulary

`abstract`, `override`, `super`, `parameter property`, `access modifier`,
`#private field`, `static factory`, `polymorphic this`, `fluent interface`,
`dependency injection`.
