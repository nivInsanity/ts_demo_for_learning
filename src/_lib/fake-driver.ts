/**
 * A deliberately tiny stand-in for a browser driver.
 *
 * It exists so modules 09 and 12 can teach page objects and fixtures without
 * pulling in Playwright, browsers, or a 400MB download. The shape is close
 * enough to the real thing that the lessons transfer; the implementation is
 * a Map and an array.
 *
 * You do not need to edit this file.
 */

export interface Driver {
  /** Navigate. Records the url. */
  goto(url: string): void;
  /** The text content of the first match, or null when nothing matches. */
  text(selector: string): string | null;
  /** Set a field's value. Creates it if it did not exist. */
  type(selector: string, value: string): void;
  /** Click something. Records the selector. */
  click(selector: string): void;
  /** True when the selector matches anything. */
  exists(selector: string): boolean;
}

export class FakeDriver implements Driver {
  /** Everything that happened, in order. Assert against this. */
  readonly log: string[] = [];

  private readonly dom: Map<string, string>;

  constructor(dom: Record<string, string> = {}) {
    this.dom = new Map(Object.entries(dom));
  }

  goto(url: string): void {
    this.log.push(`goto ${url}`);
  }

  text(selector: string): string | null {
    return this.dom.get(selector) ?? null;
  }

  type(selector: string, value: string): void {
    this.log.push(`type ${selector}=${value}`);
    this.dom.set(selector, value);
  }

  click(selector: string): void {
    this.log.push(`click ${selector}`);
  }

  exists(selector: string): boolean {
    return this.dom.has(selector);
  }

  /** Test helper: put something in the fake DOM after construction. */
  setText(selector: string, value: string): void {
    this.dom.set(selector, value);
  }

  /** Test helper: take something out again. */
  remove(selector: string): void {
    this.dom.delete(selector);
  }
}
