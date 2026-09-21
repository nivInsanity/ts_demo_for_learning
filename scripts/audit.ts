/**
 * `npm run audit`
 *
 * A tester for the repository itself, not for a learner's answers.
 *
 * `verify-solutions.ts` proves the reference answers satisfy the specs.
 * This script proves the specs and the docs are internally consistent:
 * every module has the files it should, every README points at a file
 * that exists, every "Run" command actually runs, every task mentioned
 * in a README has at least one test behind it, and no stub or doc was
 * left half-written.
 *
 * It never touches solutions/ or tasks.ts content correctness - that is
 * verify-solutions.ts's job. This one is structural: requirements, not
 * answers.
 *
 * Exits non-zero if any check fails, so it can sit in CI next to
 * typecheck/test/progress.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface Finding {
  level: 'error' | 'warn';
  module: string;
  message: string;
}

const findings: Finding[] = [];
const err = (module: string, message: string): void => {
  findings.push({ level: 'error', module, message });
};
const warn = (module: string, message: string): void => {
  findings.push({ level: 'warn', module, message });
};

const srcDir = join(root, 'src');
const solutionsDir = join(root, 'solutions');

const modules = readdirSync(srcDir)
  .filter((name) => /^m\d\d-/.test(name))
  .filter((name) => statSync(join(srcDir, name)).isDirectory())
  .sort();

if (modules.length === 0) {
  err('(repo)', 'no module directories found under src/ - did the layout change?');
}

/* ------------------------------------------------------------------ *
 * 1. Every module has the three files it needs, and a matching solution.
 * ------------------------------------------------------------------ */

for (const moduleName of modules) {
  const dir = join(srcDir, moduleName);
  const required = ['README.md', 'tasks.ts', 'tasks.test.ts'];

  for (const file of required) {
    if (!existsSync(join(dir, file))) {
      err(moduleName, `missing src/${moduleName}/${file}`);
    }
  }

  const solutionPath = join(solutionsDir, moduleName, 'tasks.ts');
  if (!existsSync(solutionPath)) {
    err(moduleName, `missing solutions/${moduleName}/tasks.ts`);
  }
}

// And nothing in solutions/ is orphaned - a stale solution for a renamed
// or deleted module would silently stop being checked by verify-solutions.
if (existsSync(solutionsDir)) {
  for (const name of readdirSync(solutionsDir)) {
    if (!existsSync(join(srcDir, name))) {
      warn('(repo)', `solutions/${name} has no matching src/${name} - orphaned?`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2. tasks.ts stubs actually throw (so a fresh clone starts red), and
 *    solutions don't have leftover "not implemented" stubs.
 * ------------------------------------------------------------------ */

for (const moduleName of modules) {
  const starterPath = join(srcDir, moduleName, 'tasks.ts');
  const solutionPath = join(solutionsDir, moduleName, 'tasks.ts');

  if (existsSync(starterPath)) {
    const stubCount = (readFileSync(starterPath, 'utf8').match(/not implemented/g) ?? []).length;
    if (stubCount === 0) {
      warn(moduleName, 'tasks.ts has no "not implemented" stub - is anything left to solve?');
    }
  }

  if (existsSync(solutionPath)) {
    const leftover = readFileSync(solutionPath, 'utf8').match(/not implemented/g);
    if (leftover !== null) {
      err(moduleName, `solutions/${moduleName}/tasks.ts still has ${leftover.length} unimplemented stub(s)`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. Every task the README lists has at least one test for it, and
 *    vice versa - a task with zero tests can never show progress, and
 *    a test group with no README row is undocumented.
 * ------------------------------------------------------------------ */

function extractReadmeTaskIds(readme: string): string[] {
  // Matches the leading "N.M" in a markdown table cell, e.g. "| 4.2 | write | ..."
  const ids: string[] = [];
  for (const line of readme.split('\n')) {
    const match = /^\|\s*(\d+\.\d+)\s*\|/.exec(line);
    if (match?.[1] !== undefined) ids.push(match[1]);
  }
  return ids;
}

function extractTestTaskIds(testFile: string): string[] {
  // Matches the leading "N.M" in a top-level describe() title.
  const ids = new Set<string>();
  const regex = /describe\(\s*['"](\d+\.\d+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(testFile)) !== null) {
    if (m[1] !== undefined) ids.add(m[1]);
  }
  return [...ids];
}

for (const moduleName of modules) {
  const readmePath = join(srcDir, moduleName, 'README.md');
  const testPath = join(srcDir, moduleName, 'tasks.test.ts');
  if (!existsSync(readmePath) || !existsSync(testPath)) continue;

  const readmeIds = extractReadmeTaskIds(readFileSync(readmePath, 'utf8'));
  const testIds = extractTestTaskIds(readFileSync(testPath, 'utf8'));

  for (const id of readmeIds) {
    if (!testIds.includes(id)) {
      err(moduleName, `README lists task ${id} but no describe('${id} ...') exists in tasks.test.ts`);
    }
  }
  for (const id of testIds) {
    if (!readmeIds.includes(id)) {
      warn(moduleName, `tasks.test.ts has describe('${id} ...') with no matching row in README.md`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 4. Relative markdown links resolve to real files.
 * ------------------------------------------------------------------ */

function checkLinks(markdownPath: string, contextLabel: string): void {
  const content = readFileSync(markdownPath, 'utf8');
  const linkRegex = /\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(content)) !== null) {
    const target = m[1];
    if (target === undefined) continue;
    if (/^(https?:|mailto:|#)/.test(target)) continue; // external or in-page anchor

    const [pathPart] = target.split('#');
    if (pathPart === undefined || pathPart === '') continue;
    const resolved = resolve(dirname(markdownPath), pathPart);
    if (!existsSync(resolved)) {
      err(contextLabel, `broken link in ${relative(root, markdownPath)}: "${target}"`);
    }
  }
}

checkLinks(join(root, 'README.md'), '(repo)');
if (existsSync(join(root, 'SETUP.md'))) checkLinks(join(root, 'SETUP.md'), '(repo)');
for (const moduleName of modules) {
  const readmePath = join(srcDir, moduleName, 'README.md');
  if (existsSync(readmePath)) checkLinks(readmePath, moduleName);
}

/* ------------------------------------------------------------------ *
 * 5. Every "Run" command in a module README is a real, working command.
 * ------------------------------------------------------------------ */

for (const moduleName of modules) {
  const readmePath = join(srcDir, moduleName, 'README.md');
  if (!existsSync(readmePath)) continue;
  const content = readFileSync(readmePath, 'utf8');

  const match = /npx vitest run (src\/[a-z0-9-]+)/.exec(content);
  if (match?.[1] === undefined) {
    warn(moduleName, 'README has no `npx vitest run src/...` command to copy-paste');
  } else if (!existsSync(join(root, match[1]))) {
    err(moduleName, `README's run command points at "${match[1]}", which does not exist`);
  }
}

/* ------------------------------------------------------------------ *
 * 6. package.json scripts point at files that exist.
 * ------------------------------------------------------------------ */

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts?: Record<string, string>;
};

for (const [name, command] of Object.entries(pkg.scripts ?? {})) {
  const fileMatch = /(scripts\/[a-zA-Z0-9_-]+\.ts)/.exec(command);
  if (fileMatch?.[1] !== undefined && !existsSync(join(root, fileMatch[1]))) {
    err('(repo)', `package.json script "${name}" runs ${fileMatch[1]}, which does not exist`);
  }
}

/* ------------------------------------------------------------------ *
 * 7. No debug leftovers in shipped source.
 * ------------------------------------------------------------------ */

for (const moduleName of modules) {
  for (const sub of ['tasks.ts', 'tasks.test.ts']) {
    const p = join(srcDir, moduleName, sub);
    if (!existsSync(p)) continue;
    const content = readFileSync(p, 'utf8');
    if (/\bdebugger\b/.test(content)) {
      warn(moduleName, `${sub} contains a "debugger" statement`);
    }
    if (/console\.(log|debug)\(/.test(content)) {
      warn(moduleName, `${sub} contains a console.log/debug left in`);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Report.
 * ------------------------------------------------------------------ */

const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level === 'warn');

console.log('');
console.log('  Repository audit');
console.log('  ' + '─'.repeat(60));

if (findings.length === 0) {
  console.log('  All structural checks passed. No errors, no warnings.');
} else {
  for (const f of [...errors, ...warnings]) {
    const tag = f.level === 'error' ? 'ERROR' : 'warn ';
    console.log(`  [${tag}] ${f.module.padEnd(24)} ${f.message}`);
  }
}

console.log('  ' + '─'.repeat(60));
console.log(`  ${errors.length} error(s), ${warnings.length} warning(s)`);
console.log('');

process.exit(errors.length > 0 ? 1 : 0);
