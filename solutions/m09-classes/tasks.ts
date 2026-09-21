/** Module 09 - reference solution. */

import type { Driver } from '../../src/_lib/fake-driver';

/* --- 9.1 ---------------------------------------------------------- */
export abstract class BasePage {
  // Parameter properties: `protected readonly driver: Driver` in the
  // parameter list declares the field AND assigns it. `protected` means
  // subclasses can use it and callers cannot.
  protected constructor(
    protected readonly driver: Driver,
    private readonly baseUrl: string,
  ) {}

  // `abstract` says "every concrete subclass must supply this". The base
  // class can use `this.path` in `url` without knowing what it will be.
  abstract readonly path: string;

  abstract isLoaded(): boolean;

  get url(): string {
    return `${this.baseUrl.replace(/\/+$/, '')}/${this.path.replace(/^\/+/, '')}`;
  }

  // The return type is `this`, not `BasePage`. That is a polymorphic this
  // type: called on an AdminLoginPage it returns AdminLoginPage, so chaining
  // survives inheritance. `BasePage` here would flatten every chain to the
  // base type and break `.login(...)` on the next line.
  open(): this {
    this.driver.goto(this.url);
    return this;
  }
}

export class LoginPage extends BasePage {
  // The explicit `: string` matters. Without it TypeScript infers the literal
  // type '/login' for a readonly field, and AdminLoginPage could not narrow
  // to a different literal.
  readonly path: string = '/login';

  constructor(driver: Driver, baseUrl: string) {
    super(driver, baseUrl);
  }

  isLoaded(): boolean {
    return this.driver.exists('#login-form');
  }

  login(username: string, password: string): this {
    this.driver.type('#username', username);
    this.driver.type('#password', password);
    this.driver.click('#submit');
    return this;
  }

  errorMessage(): string | null {
    return this.driver.text('.error');
  }
}

/* --- 9.2 ---------------------------------------------------------- */
export class AdminLoginPage extends LoginPage {
  // `override` is required by `noImplicitOverride` when you replace a member
  // the parent actually defines. It is not required for implementing an
  // `abstract` member, because there was nothing to override.
  override readonly path: string = '/admin/login';

  override isLoaded(): boolean {
    // Calling `super.isLoaded()` rather than repeating the '#login-form'
    // check means a change to the login page's definition of "loaded"
    // automatically applies here. Copy-paste inheritance is how page objects
    // rot.
    return super.isLoaded() && this.driver.exists('#admin-badge');
  }
}

/* --- 9.3 ---------------------------------------------------------- *
 * The bug: `const increment = counter.increment` copies the FUNCTION, not
 * the binding to the object it came from.
 *
 * In JavaScript `this` is decided by how a function is CALLED, not where it
 * was defined. `counter.increment()` sets `this` to `counter`.
 * `increment()` sets `this` to undefined (modules are strict mode), so
 * `this.count` throws.
 *
 * Three fixes, all fine:
 *   const increment = counter.increment.bind(counter);
 *   const increment = () => counter.increment();
 *   ...or define `increment = () => { ... }` as an arrow field in the class,
 *      which binds at construction time.
 *
 * You will meet this the moment you pass a method to `addEventListener`,
 * `setTimeout`, `forEach`, or a test hook.
 */
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
  const increment = counter.increment.bind(counter);

  for (let i = 0; i < times; i += 1) {
    increment();
  }

  return counter.value;
}

/* --- 9.4 ---------------------------------------------------------- */
export class StepRecorder {
  // `#steps` is a real runtime private: it does not exist on the object as
  // far as any outside code is concerned, not even via bracket access or
  // Object.keys. TypeScript's `private` is erased at compile time and only
  // stops *you*, not a determined caller.
  readonly #steps: string[] = [];

  private constructor(readonly name: string) {}

  static start(name: string): StepRecorder {
    return new StepRecorder(name);
  }

  step(message: string): this {
    this.#steps.push(message);
    return this;
  }

  get steps(): readonly string[] {
    // A copy. `readonly string[]` is a compile-time promise only - a caller
    // who casts can still push into the array you handed out.
    return [...this.#steps];
  }

  toString(): string {
    const trail = this.#steps.length === 0 ? '(no steps)' : this.#steps.join(' > ');
    return `${this.name}: ${trail}`;
  }
}

/* --- 9.5 ---------------------------------------------------------- */
export interface Logger {
  log(message: string): void;
}

export interface Clock {
  now(): number;
}

export class MemoryLogger implements Logger {
  readonly lines: string[] = [];

  log(message: string): void {
    this.lines.push(message);
  }
}

export class SuiteRunner {
  constructor(
    private readonly logger: Logger,
    private readonly clock: Clock,
  ) {}

  run(name: string, fn: () => void): number {
    this.logger.log(`start ${name}`);
    const started = this.clock.now();

    try {
      fn();
    } catch (error) {
      const elapsed = this.clock.now() - started;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.log(`fail ${name} (${elapsed}ms): ${message}`);
      throw error;
    }

    const elapsed = this.clock.now() - started;
    this.logger.log(`pass ${name} (${elapsed}ms)`);
    return elapsed;
  }
}

/*
 * Why inject the clock?
 *
 * Because `Date.now()` inside `run` would make the duration untestable: you
 * could only assert "some number, probably small", which is not an assertion.
 * With a Clock interface the test supplies 1000 and 1250 and asserts 250.
 *
 * Same argument for the logger. `SuiteRunner` depends on two small
 * interfaces, not on console or the system clock, and the test decides what
 * they do. That is the whole of dependency injection - no framework required.
 */
