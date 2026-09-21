/**
 * Module 12 - Patterns you will actually write at work
 *
 * Read src/m12-qa-patterns/README.md first.
 *
 * Everything here is a pattern that shows up in every serious test codebase,
 * whatever the framework. Nothing in this module is TypeScript trivia.
 */

/* ------------------------------------------------------------------ *
 * Task 12.1 - the test data builder
 *
 * The problem it solves: a test that says
 *
 *   createUser({ id: 1, email: 'a@b.c', role: 'admin', active: true, tags: [] })
 *
 * buries the one field the test is about under four it does not care about.
 * A builder gives you sane defaults and lets each test name only what matters:
 *
 *   UserBuilder.aUser().asAdmin().build()
 *
 * Requirements:
 *  - `UserBuilder.aUser()` is the entry point; the constructor is private
 *  - defaults: id 1, email 'user1@example.com', role 'user', active true,
 *    tags []
 *  - `withId(id)` also updates the default email to `user<id>@example.com`,
 *    unless `withEmail` was called explicitly
 *  - every `with*` method returns `this` so calls chain
 *  - `build()` returns a FRESH object every time, with its own `tags` array
 *  - the builder stays reusable: building twice gives two equal but
 *    independent objects, and mutating one must not affect the builder
 *  - `buildMany(n)` returns n users with ids counting up from the current id,
 *    each with the matching default email (unless an explicit email was set,
 *    in which case they all share it)
 * ------------------------------------------------------------------ */
export type Role = 'admin' | 'user' | 'guest';

export interface User {
  id: number;
  email: string;
  role: Role;
  active: boolean;
  tags: string[];
}

export class UserBuilder {
  // TODO
}

/* ------------------------------------------------------------------ *
 * Task 12.2 - find the bug
 *
 * The older, uglier cousin of the builder: a factory function with a shared
 * defaults object. It works exactly once per process.
 *
 * Symptoms:
 *  - the second call inherits the first call's overrides
 *  - `DEFAULT_USER` itself is different after any call
 *  - every user shares one `tags` array
 *
 * All three are the same root cause. Fix `makeUser` without changing its
 * signature, and leave `DEFAULT_USER` untouched by any call.
 * ------------------------------------------------------------------ */
export const DEFAULT_USER: User = {
  id: 1,
  email: 'user1@example.com',
  role: 'user',
  active: true,
  tags: [],
};

export function makeUser(overrides: Partial<User> = {}): User {
  return Object.assign(DEFAULT_USER, overrides);
}

/* ------------------------------------------------------------------ *
 * Task 12.3 - fixtures with guaranteed teardown
 *
 * A fixture is a pair: make the thing, then destroy it. The contract that
 * matters is that teardown runs even when the test explodes - otherwise one
 * failing test leaks a browser, a database row or a temp directory into
 * every test after it.
 *
 *   withFixture(fixture, async (value) => { ... })
 *
 *  - runs `setup`, passes the value to `use`, then runs `teardown`
 *  - `teardown` runs whether `use` succeeded or threw
 *  - the result of `use` is returned; an error from `use` is re-thrown
 *  - if `teardown` itself throws while `use` succeeded, that error surfaces
 *  - if `teardown` throws while `use` was already failing, the ORIGINAL
 *    error wins - a cleanup failure must never hide a test failure
 *
 *   withFixtures([a, b, c], async (values) => { ... })
 *
 *  - sets up in order a, b, c
 *  - tears down in REVERSE order c, b, a, because c may depend on b
 *  - if a setup throws, everything already set up is still torn down,
 *    in reverse order, and the setup error is re-thrown
 * ------------------------------------------------------------------ */
export interface Fixture<T> {
  name: string;
  setup(): Promise<T>;
  teardown(value: T): Promise<void>;
}

export function withFixture<T, R>(
  fixture: Fixture<T>,
  use: (value: T) => Promise<R>,
): Promise<R> {
  throw new Error('not implemented: withFixture');
}

export function withFixtures<R>(
  fixtures: Fixture<unknown>[],
  use: (values: unknown[]) => Promise<R>,
): Promise<R> {
  throw new Error('not implemented: withFixtures');
}

/* ------------------------------------------------------------------ *
 * Task 12.4 - soft assertions
 *
 * A normal assertion stops at the first failure, so a form with four broken
 * fields takes four runs to diagnose. Soft assertions collect everything and
 * report once.
 *
 *  - `check(label, condition)` records `label` when the condition is false
 *  - `equal(label, actual, expected)` compares with Object.is and records
 *    `<label>: expected <expected>, got <actual>` on failure, where both
 *    values go through JSON.stringify
 *  - both return `this`
 *  - `failures` returns a readonly copy
 *  - `assertAll()` does nothing when there are no failures; otherwise it
 *    throws an Error whose message is
 *
 *      3 soft assertion(s) failed:
 *        - first
 *        - second
 *        - third
 *
 *    (one leading newline after the colon, two spaces, '- ', one per line)
 *  - `assertAll()` clears the failures, so the same instance can be reused
 * ------------------------------------------------------------------ */
export class SoftAssert {
  // TODO
}
