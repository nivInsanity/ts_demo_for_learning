/** Module 04 - reference solution. */

/* --- 4.1 ---------------------------------------------------------- */
export type StepResult =
  | { kind: 'passed'; name: string; durationMs: number }
  | { kind: 'failed'; name: string; durationMs: number; error: string }
  | { kind: 'skipped'; name: string; reason: string };

export function formatStep(step: StepResult): string {
  // Inside each branch TypeScript knows exactly which member it is holding,
  // so `step.reason` is available in the 'skipped' branch and nowhere else.
  // No optional chaining, no non-null assertions, no casts.
  switch (step.kind) {
    case 'passed':
      return `PASS ${step.name} (${step.durationMs}ms)`;
    case 'failed':
      return `FAIL ${step.name} (${step.durationMs}ms): ${step.error}`;
    case 'skipped':
      return `SKIP ${step.name}: ${step.reason}`;
  }
}

/* --- 4.2 ---------------------------------------------------------- */
export function assertNever(value: never): never {
  throw new TypeError(`Unhandled case: ${JSON.stringify(value)}`);
}

export function exitCodeFor(step: StepResult): number {
  switch (step.kind) {
    case 'passed':
    case 'skipped':
      return 0;
    case 'failed':
      return 1;
    default:
      // Reachable only if something bypassed the type system - a JSON
      // payload, an `any`, a cast. Which happens constantly in test code.
      return assertNever(step);
  }
}

/* --- 4.3 ---------------------------------------------------------- */
export interface FailedStep {
  kind: 'failed';
  name: string;
  durationMs: number;
  error: string;
}

// `step is FailedStep` is a *type predicate*. At runtime this is just a
// boolean; at compile time it teaches the checker what a `true` means.
// You are taking responsibility for the check being correct - the compiler
// trusts you here, so keep predicates small and obviously right.
export function isFailed(step: StepResult): step is FailedStep {
  return step.kind === 'failed';
}

export function failedSteps(steps: StepResult[]): FailedStep[] {
  return steps.filter(isFailed);
}

export function firstErrorMessage(steps: StepResult[]): string | null {
  const first = steps.find(isFailed);
  return first ? first.error : null;
}

/* --- 4.4 ---------------------------------------------------------- *
 * The bug is `typeof null === 'object'`.
 *
 * It has been true since the first JavaScript implementation, where values
 * were tagged in their low bits and the null pointer had the object tag. It
 * cannot be fixed without breaking a large fraction of the web.
 *
 * Practical consequence: any `typeof x === 'object'` check must be preceded
 * by an explicit `x === null` check. TypeScript will not save you here,
 * because `typeof null === 'object'` is genuinely true - the types are
 * correct, the runtime is the liar.
 */
export function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `array(${value.length})`;
  if (typeof value === 'object') return `object{${Object.keys(value).length}}`;
  return typeof value;
}

/* --- 4.5 ---------------------------------------------------------- */
export function assertIsString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new TypeError(`${label} must be a string, got ${typeof value}`);
  }
}

export function upperCaseAll(values: unknown[]): string[] {
  return values.map((value, index) => {
    assertIsString(value, `values[${index}]`);
    // After the assertion, `value` is a string for the rest of this callback.
    return value.toUpperCase();
  });
}

/*
 * Worth knowing: the generic version is the one you will actually reach for.
 *
 *   export function assertDefined<T>(
 *     value: T | null | undefined,
 *     label: string,
 *   ): asserts value is T {
 *     if (value === null || value === undefined) {
 *       throw new TypeError(`${label} is ${value}`);
 *     }
 *   }
 *
 * Generics are module 05. One TypeScript rule to remember: a call to an
 * assertion function only narrows if the function reference has an explicit
 * type - which an imported `function` declaration does, but a `const` holding
 * an arrow function does not, unless you annotate it.
 */
