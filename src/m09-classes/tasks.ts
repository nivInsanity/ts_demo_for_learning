/**
 * Module 09 - Classes, inheritance and composition
 *
 * Read src/m09-classes/README.md first.
 *
 * Coming from Java or C# this will feel familiar, and that is the trap.
 * TypeScript classes have `readonly`, parameter properties, `#private`
 * fields, `abstract`, `override`, and a `this` that can be lost entirely -
 * and only some of that maps onto what you already know.
 */

import type { Driver } from '../_lib/fake-driver';

/* ------------------------------------------------------------------ *
 * Task 9.1 - an abstract base page
 *
 * `BasePage` is the spine of every page-object hierarchy ever written.
 *
 * Requirements:
 *  - `protected constructor(driver: Driver, baseUrl: string)` - protected, so
 *    nobody can instantiate a BasePage directly
 *  - `driver` is available to subclasses but not to outside callers
 *  - `abstract readonly path: string` - each page declares its own
 *  - `abstract isLoaded(): boolean`
 *  - `get url(): string` -> baseUrl + path, with exactly one slash between
 *  - `open(): this` -> calls `driver.goto(this.url)` and returns `this`,
 *    so callers can write `new LoginPage(d, url).open().login(...)`
 *
 * Then `LoginPage`:
 *  - `path` is '/login'
 *  - `isLoaded()` is true when the driver has '#login-form'
 *  - `login(user, password): this` types into '#username' and '#password',
 *    then clicks '#submit'
 *  - `errorMessage(): string | null` returns the text of '.error'
 *
 * Returning `this` rather than `LoginPage` is what keeps chaining working
 * for subclasses too. Try it with `LoginPage` and see what breaks in 9.2.
 * ------------------------------------------------------------------ */
export abstract class BasePage {
  // TODO: constructor, abstract members, url getter, open()
}

export class LoginPage extends BasePage {
  // TODO
}

/* ------------------------------------------------------------------ *
 * Task 9.2 - override and super
 *
 * `AdminLoginPage` is a LoginPage at '/admin/login' which is only considered
 * loaded when the normal login form is there AND an '#admin-badge' exists.
 *
 *  - `path` is '/admin/login'
 *  - `isLoaded()` must CALL `super.isLoaded()` rather than re-checking
 *    '#login-form' itself, and also require '#admin-badge'
 *  - because `tsconfig.json` sets `noImplicitOverride`, the `override`
 *    keyword is mandatory where you replace a concrete member
 * ------------------------------------------------------------------ */
export class AdminLoginPage extends LoginPage {
  // TODO
}

/* ------------------------------------------------------------------ *
 * Task 9.3 - find the bug
 *
 * `countRetries` should call `counter.increment()` three times and return the
 * final count. Instead it throws:
 *
 *   TypeError: Cannot read properties of undefined (reading 'count')
 *
 * The method is fine. The class is fine. The way the method is *passed* is
 * not. This is the single most common `this` mistake in JavaScript, and it
 * turns up constantly when wiring class methods into event handlers,
 * `forEach`, or a test hook.
 *
 * Fix `countRetries` without changing `RetryCounter`.
 * ------------------------------------------------------------------ */
export class RetryCounter {
  private count = 0;

  increment(): number {
    this.count += 1;
    return this.count;
  }

  get value(): number {
    return this.count;
  }
}

export function countRetries(counter: RetryCounter, times: number): number {
  const increment = counter.increment;

  for (let i = 0; i < times; i += 1) {
    increment();
  }

  return counter.value;
}

/* ------------------------------------------------------------------ *
 * Task 9.4 - encapsulation, static factories, fluent APIs
 *
 * A recorder for the steps a test went through, so a failure message can say
 * what happened rather than just what broke.
 *
 *  - `StepRecorder.start(name)` is the ONLY way to make one; the constructor
 *    must be private
 *  - `step(message): this` appends and returns itself, so calls chain
 *  - `get name(): string`
 *  - `get steps(): readonly string[]` returns a COPY - a caller must not be
 *    able to reach in and rewrite history
 *  - `toString()` -> `<name>: a > b > c`, or just `<name>: (no steps)`
 *
 * Use a `#private` field for the steps array. `#` is a real JavaScript
 * runtime private; `private` is a TypeScript-only marker that disappears
 * when the code compiles.
 * ------------------------------------------------------------------ */
export class StepRecorder {
  // TODO
}

/* ------------------------------------------------------------------ *
 * Task 9.5 - composition and dependency injection
 *
 * `SuiteRunner` needs to log, and needs to know the time. Both are injected,
 * which is what makes it testable: the tests pass a fake clock and read the
 * log, with no timers and no flakiness.
 *
 *  - `run(name, fn): number` returns the elapsed milliseconds
 *  - on success it logs `start <name>` then `pass <name> (<ms>ms)`
 *  - on failure it logs `start <name>` then `fail <name> (<ms>ms): <message>`
 *    and re-throws the original error
 *  - elapsed time is `clock.now()` after minus `clock.now()` before
 *
 * Implement `MemoryLogger` too - it collects lines into `lines`.
 * ------------------------------------------------------------------ */
export interface Logger {
  log(message: string): void;
}

export interface Clock {
  now(): number;
}

export class MemoryLogger implements Logger {
  // TODO: a readonly `lines` array and a `log` method
  log(message: string): void {
    throw new Error('not implemented: MemoryLogger.log');
  }
}

export class SuiteRunner {
  // TODO: constructor(logger: Logger, clock: Clock)

  run(name: string, fn: () => void): number {
    throw new Error('not implemented: SuiteRunner.run');
  }
}
