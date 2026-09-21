/** Module 12 - reference solution. */

/* --- 12.1 --------------------------------------------------------- */
export type Role = 'admin' | 'user' | 'guest';

export interface User {
  id: number;
  email: string;
  role: Role;
  active: boolean;
  tags: string[];
}

export class UserBuilder {
  #id = 1;
  // null means "nobody set one, derive it from the id". A sentinel is what
  // lets `withId` update the default email without clobbering an explicit one.
  #email: string | null = null;
  #role: Role = 'user';
  #active = true;
  #tags: string[] = [];

  private constructor() {}

  static aUser(): UserBuilder {
    return new UserBuilder();
  }

  withId(id: number): this {
    this.#id = id;
    return this;
  }

  withEmail(email: string): this {
    this.#email = email;
    return this;
  }

  withRole(role: Role): this {
    this.#role = role;
    return this;
  }

  asAdmin(): this {
    return this.withRole('admin');
  }

  asGuest(): this {
    return this.withRole('guest');
  }

  inactive(): this {
    this.#active = false;
    return this;
  }

  withTag(tag: string): this {
    this.#tags.push(tag);
    return this;
  }

  build(): User {
    return this.#makeUser(this.#id);
  }

  buildMany(count: number): User[] {
    return Array.from({ length: count }, (_unused, offset) => this.#makeUser(this.#id + offset));
  }

  // `[...this.#tags]` on every build is the whole trick. Without it every
  // user shares one array, and a test that pushes a tag onto "its" user
  // rewrites the fixture for everybody.
  #makeUser(id: number): User {
    return {
      id,
      email: this.#email ?? `user${id}@example.com`,
      role: this.#role,
      active: this.#active,
      tags: [...this.#tags],
    };
  }
}

/* --- 12.2 --------------------------------------------------------- *
 * The bug was `Object.assign(DEFAULT_USER, overrides)`.
 *
 * `Object.assign` writes into its FIRST argument and returns it. So every
 * call mutated the shared default and handed back the same object. Call it
 * twice with different overrides and the second result carries the first
 * call's fields; `DEFAULT_USER` drifts further from its name on every test.
 *
 * `Object.assign({}, DEFAULT_USER, overrides)` fixes the identity problem;
 * the spread below is the same thing with less ceremony. The second spread
 * of `tags` handles the nested-mutable case from module 03 - a shallow copy
 * is not enough when a property is itself an array.
 */
export const DEFAULT_USER: User = {
  id: 1,
  email: 'user1@example.com',
  role: 'user',
  active: true,
  tags: [],
};

export function makeUser(overrides: Partial<User> = {}): User {
  const merged = { ...DEFAULT_USER, ...overrides };
  return { ...merged, tags: [...merged.tags] };
}

/* --- 12.3 --------------------------------------------------------- */
export interface Fixture<T> {
  name: string;
  setup(): Promise<T>;
  teardown(value: T): Promise<void>;
}

export async function withFixture<T, R>(
  fixture: Fixture<T>,
  use: (value: T) => Promise<R>,
): Promise<R> {
  const value = await fixture.setup();

  let result: R;
  try {
    result = await use(value);
  } catch (error) {
    try {
      await fixture.teardown(value);
    } catch {
      // Deliberately swallowed. The test failure is the interesting one; a
      // cleanup error reported on top of it sends everyone to the wrong file.
      // In a real harness you would log this rather than drop it silently.
    }
    throw error;
  }

  // Outside the try on purpose: if the body succeeded and cleanup failed,
  // the cleanup error IS the news.
  await fixture.teardown(value);
  return result;
}

export async function withFixtures<R>(
  fixtures: Fixture<unknown>[],
  use: (values: unknown[]) => Promise<R>,
): Promise<R> {
  const started: Array<{ fixture: Fixture<unknown>; value: unknown }> = [];

  const teardownAll = async (): Promise<void> => {
    // Reverse order: the last thing built may depend on the first, so it
    // has to go first. This is the same reason `finally` blocks unwind
    // inside out.
    for (let i = started.length - 1; i >= 0; i -= 1) {
      const entry = started[i]!;
      await entry.fixture.teardown(entry.value);
    }
  };

  try {
    for (const fixture of fixtures) {
      const value = await fixture.setup();
      started.push({ fixture, value });
    }
  } catch (error) {
    try {
      await teardownAll();
    } catch {
      /* see above */
    }
    throw error;
  }

  const values = started.map((entry) => entry.value);

  let result: R;
  try {
    result = await use(values);
  } catch (error) {
    try {
      await teardownAll();
    } catch {
      /* see above */
    }
    throw error;
  }

  await teardownAll();
  return result;
}

/* --- 12.4 --------------------------------------------------------- */
export class SoftAssert {
  #failures: string[] = [];

  check(label: string, condition: boolean): this {
    if (!condition) this.#failures.push(label);
    return this;
  }

  equal<T>(label: string, actual: T, expected: T): this {
    // `Object.is` rather than `===` so NaN equals NaN and +0 does not equal
    // -0. For a comparison helper those are the right answers, even though
    // they are the ones `===` gets wrong.
    if (!Object.is(actual, expected)) {
      this.#failures.push(
        `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
      );
    }
    return this;
  }

  get failures(): readonly string[] {
    return [...this.#failures];
  }

  assertAll(): void {
    if (this.#failures.length === 0) return;

    const message = [
      `${this.#failures.length} soft assertion(s) failed:`,
      ...this.#failures.map((failure) => `  - ${failure}`),
    ].join('\n');

    // Clear before throwing, so a shared instance is usable again and the
    // same failures are not reported twice at the end of the next test.
    this.#failures = [];
    throw new Error(message);
  }
}

/*
 * A word of caution about soft assertions: they are a diagnostic tool, not a
 * default. A test with fifteen soft assertions is usually fifteen tests
 * wearing a trench coat, and when it fails you still have to read all
 * fifteen lines to find out what it was actually checking. Use them where
 * one page genuinely has several independent facts worth reporting together.
 */
