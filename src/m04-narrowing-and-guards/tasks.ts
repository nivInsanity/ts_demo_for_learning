/**
 * Module 04 - Unions, narrowing and type guards
 *
 * Read src/m04-narrowing-and-guards/README.md first.
 *
 * This is the module where TypeScript stops being "Java with a funny syntax"
 * and starts being its own thing. Take your time here.
 */

/* ------------------------------------------------------------------ *
 * Task 4.1 - a discriminated union
 *
 * Replace the placeholder below with a union of three object types that all
 * share a literal `kind` property:
 *
 *   { kind: 'passed';  name: string; durationMs: number }
 *   { kind: 'failed';  name: string; durationMs: number; error: string }
 *   { kind: 'skipped'; name: string; reason: string }
 *
 * Note that 'skipped' has no duration - because a skipped step never ran.
 * Modelling that honestly is the whole point: with one flat interface full
 * of optional fields you would need a comment explaining which combinations
 * are real. With a union the compiler enforces it.
 *
 * Then implement `formatStep`:
 *
 *   PASS login (1234ms)
 *   FAIL login (1234ms): expected 200, got 500
 *   SKIP login: no test account on staging
 * ------------------------------------------------------------------ */
export type StepResult = {
  // TODO: replace this placeholder with the three-member union
  kind: string;
  name: string;
  durationMs?: number;
  error?: string;
  reason?: string;
};

export function formatStep(step: StepResult): string {
  throw new Error('not implemented: formatStep');
}

/* ------------------------------------------------------------------ *
 * Task 4.2 - exhaustiveness with `never`
 *
 * `assertNever` is the standard trick for "I have handled every case, and if
 * someone adds a fourth one I want a compile error, not a silent fallthrough".
 *
 * Give it the signature `(value: never) => never` and have it throw a
 * TypeError whose message includes the JSON of what it received.
 *
 * Then implement `exitCodeFor` with a `switch` over `step.kind`:
 *   passed  -> 0
 *   skipped -> 0
 *   failed  -> 1
 * and call `assertNever(step)` in the default branch.
 *
 * If your switch is exhaustive, `step` in the default branch has type `never`
 * and the call compiles. If you forget a case, it does not. That is the whole
 * mechanism, and it is worth more than any amount of code review.
 * ------------------------------------------------------------------ */
export function assertNever(value: unknown): never {
  throw new Error('not implemented: assertNever');
}

export function exitCodeFor(step: StepResult): number {
  throw new Error('not implemented: exitCodeFor');
}

/* ------------------------------------------------------------------ *
 * Task 4.3 - a type predicate
 *
 * `isFailed` must be a *type predicate*: its return type is
 * `step is FailedStep`, not `boolean`. That extra word is what lets
 * `steps.filter(isFailed)` hand you back a `FailedStep[]` instead of a
 * `StepResult[]` you then have to cast.
 *
 * Define `FailedStep` as the 'failed' member of the union - do it by hand for
 * now; module 10 shows you `Extract<StepResult, { kind: 'failed' }>`.
 *
 * Then implement `failedSteps`, and `firstErrorMessage` which returns the
 * error of the first failed step, or null if nothing failed.
 * ------------------------------------------------------------------ */
export interface FailedStep {
  // TODO: the shape of the 'failed' union member
  kind: string;
  name: string;
}

export function isFailed(step: StepResult): boolean {
  // TODO: change the return type to a type predicate, then implement
  throw new Error('not implemented: isFailed');
}

export function failedSteps(steps: StepResult[]): FailedStep[] {
  throw new Error('not implemented: failedSteps');
}

export function firstErrorMessage(steps: StepResult[]): string | null {
  throw new Error('not implemented: firstErrorMessage');
}

/* ------------------------------------------------------------------ *
 * Task 4.4 - find the bug
 *
 * This describes an arbitrary value for a debug log. It handles six of the
 * seven cases correctly. The seventh does not return a wrong answer - it
 * throws, which is worse, because it takes down the logger that was supposed
 * to help you debug.
 *
 * Expected output:
 *   null        -> 'null'
 *   undefined   -> 'undefined'
 *   [1, 2, 3]   -> 'array(3)'
 *   { a: 1 }    -> 'object{1}'
 *   'hello'     -> 'string'
 *   42          -> 'number'
 *   true        -> 'boolean'
 *   () => {}    -> 'function'
 *
 * Find it, name it, fix it. The cause is a JavaScript quirk from 1995 that
 * has never been fixed because fixing it would break the web.
 * ------------------------------------------------------------------ */
export function describeValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (typeof value === 'object') {
    return `object{${Object.keys(value as object).length}}`;
  }

  if (value === undefined) {
    return 'undefined';
  }

  return typeof value;
}

/* ------------------------------------------------------------------ *
 * Task 4.5 - assertion functions
 *
 * An assertion function narrows a variable for the rest of the enclosing
 * scope by throwing when the assumption does not hold. Its return type is
 * `asserts value is string` - not `boolean`, not `void`.
 *
 * `assertIsString(value, label)` throws a TypeError whose message is
 * exactly `${label} must be a string, got ${typeof value}`.
 *
 * Then implement `upperCaseAll`, which maps `unknown[]` to `string[]` and
 * throws on the first element that is not a string, with the label
 * `values[<index>]`.
 *
 * One of the tests only compiles once your return type is right. That is
 * deliberate: `npm run typecheck` is part of the grade here.
 * ------------------------------------------------------------------ */
export function assertIsString(value: unknown, label: string): void {
  // TODO: change the return type to `asserts value is string`, then implement
  throw new Error('not implemented: assertIsString');
}

export function upperCaseAll(values: unknown[]): string[] {
  throw new Error('not implemented: upperCaseAll');
}
