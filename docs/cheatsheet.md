# Cheat sheet

Everything this course covers, on one page. Keep it open while you work.

## Basic types

```ts
let name: string;
let count: number;                  // no int/float distinction
let ok: boolean;
let ids: number[];                  // or Array<number>
let pair: [string, number];         // tuple — exactly two, in that order
let anything: unknown;              // safe: you must narrow before using
let nothing: never;                 // no value can ever be this
```

## Unions and literals

```ts
type Status = 'passed' | 'failed' | 'skipped';
type Id = string | number;

const MODES = ['fast', 'slow'] as const;   // readonly ['fast', 'slow']
type Mode = (typeof MODES)[number];        // 'fast' | 'slow'
```

## Interfaces and objects

```ts
interface TestCase {
  readonly id: string;              // cannot be reassigned
  title: string;
  tags?: string[];                  // optional — string[] | undefined
  owner?: { name: string };
}

type Counts = Record<Status, number>;      // { passed: number; ... }
type Bag = { [key: string]: unknown };     // index signature
```

## Functions

```ts
function f(a: string, b = 3, ...rest: number[]): void {}

type Validator = (value: string) => string | null;

// overloads: callers see the first two, not the third
function range(end: number): number[];
function range(start: number, end: number): number[];
function range(a: number, b?: number): number[] { /* ... */ }
```

## Narrowing

```ts
typeof value === 'string'        // primitives
value instanceof HttpError       // classes
'error' in step                  // property presence
step.kind === 'failed'           // discriminant — the good one
value === null                   // ALWAYS before typeof x === 'object'
```

```ts
function isFailed(s: Step): s is FailedStep { return s.kind === 'failed'; }
function assertIsString(v: unknown): asserts v is string { /* throws */ }

function assertNever(value: never): never {   // exhaustiveness
  throw new TypeError(`Unhandled: ${JSON.stringify(value)}`);
}
```

## Generics

```ts
function first<T>(items: T[]): T | undefined { return items[0]; }
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] { /* ... */ }

class Registry<T> { /* ... */ }
interface ApiResponse<TBody = unknown> { body: TBody }
```

## Utility types

| | |
| --- | --- |
| `Partial<T>` | all optional |
| `Required<T>` | all mandatory |
| `Readonly<T>` | all readonly |
| `Pick<T, K>` | only these keys |
| `Omit<T, K>` | all but these keys |
| `Record<K, V>` | object with keys K, values V |
| `Exclude<U, X>` / `Extract<U, X>` | filter a union |
| `NonNullable<T>` | drop null and undefined |
| `ReturnType<F>` / `Parameters<F>` | pull a function apart |
| `Awaited<T>` | what a promise resolves to |

## Type-level tools

```ts
type Keys = keyof TestRun;                 // 'id' | 'suite' | ...
type Value = TestRun['suite'];             // indexed access
type Shape = typeof someValue;             // value → type

type Nullable<T> = { [K in keyof T]: T[K] | null };        // mapped
type Unwrap<T> = T extends Promise<infer U> ? U : T;       // conditional
type Selector<T extends string> = `[data-testid="${T}"]`;  // template literal
```

## Async

```ts
await delay(100);
const winner = await Promise.race([work, timeout]);
const all = await Promise.all(items.map(fn));        // all at once
const every = await Promise.allSettled(checks);      // never rejects
for (const t of tasks) await t();                    // one at a time
```

`forEach`, `map`, `filter` and `sort` **do not await** an async callback.
Only `for...of` does.

## Errors

```ts
class HttpError extends Error {
  constructor(public readonly status: number, url: string) {
    super(`HTTP ${status} for ${url}`);
    this.name = 'HttpError';            // without this it prints as "Error"
  }
}

try { ... } catch (error) {             // error is `unknown`, not `Error`
  if (error instanceof HttpError) { /* ... */ }
}

throw new Error('seeding failed', { cause: original });   // keeps the chain
```

## Classes

```ts
abstract class BasePage {
  protected constructor(protected readonly driver: Driver) {}
  abstract readonly path: string;
  open(): this { return this; }          // `this` keeps chaining polymorphic
}

class LoginPage extends BasePage {
  readonly path: string = '/login';
  #secret = 'real runtime private';
  override toString(): string { return 'login'; }
}
```

`const f = obj.method` loses `this`. Use `.bind(obj)` or `() => obj.method()`.

## Safety

```ts
const parsed: unknown = JSON.parse(raw);     // never leave it as `any`
value as Foo                                 // checks NOTHING — prove it first
value!                                       // same, but shorter and worse
a ?? b                                       // fallback only for null/undefined
a || b                                       // fallback for 0, '', false too
obj?.deep?.value                             // short-circuits on null/undefined

const CONFIG = { ... } satisfies Record<string, EnvConfig>;  // check, don't widen
```

## Arrays: mutates or copies

| Mutates | Copies |
| --- | --- |
| `sort` `reverse` `splice` `push` `pop` `shift` `unshift` | `map` `filter` `slice` `concat` `flatMap` `toSorted` `toReversed` `with` |

`[1, 2, 10].sort()` gives `[1, 10, 2]`. Numbers always need
`.sort((a, b) => a - b)`.
