/**
 * `npm run progress`
 *
 * Runs the whole suite plus the type checker and reports where you are,
 * module by module and task by task. Also rewrites PROGRESS.md so the same
 * information is readable on GitHub without running anything.
 *
 * It never fails the build - it is a dashboard, not a gate.
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, '.progress.json');

/* ------------------------------------------------------------------ *
 * 1. Run the tests, machine readable.
 * ------------------------------------------------------------------ */

interface AssertionResult {
  ancestorTitles: string[];
  title: string;
  fullName: string;
  status: string;
}

interface FileResult {
  name: string;
  status: string;
  message?: string;
  assertionResults: AssertionResult[];
}

interface VitestJson {
  numTotalTests: number;
  numPassedTests: number;
  testResults: FileResult[];
}

function runTests(): VitestJson {
  rmSync(jsonPath, { force: true });

  spawnSync(
    process.execPath,
    [
      join(root, 'node_modules', 'vitest', 'vitest.mjs'),
      'run',
      '--reporter=json',
      `--outputFile=${jsonPath}`,
    ],
    { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] },
  );

  if (!existsSync(jsonPath)) {
    return { numTotalTests: 0, numPassedTests: 0, testResults: [] };
  }

  try {
    return JSON.parse(readFileSync(jsonPath, 'utf8')) as VitestJson;
  } catch {
    return { numTotalTests: 0, numPassedTests: 0, testResults: [] };
  }
}

/* ------------------------------------------------------------------ *
 * 2. Run the type checker and attribute each error to a module.
 * ------------------------------------------------------------------ */

function runTypecheck(): Map<string, number> {
  const result = spawnSync(
    process.execPath,
    [join(root, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit', '--pretty', 'false'],
    { cwd: root, encoding: 'utf8' },
  );

  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  const byModule = new Map<string, number>();

  for (const line of output.split('\n')) {
    if (!line.includes('): error TS')) continue;
    const match = /(?:^|[\\/])src[\\/](m\d\d-[a-z0-9-]+)[\\/]/.exec(line);
    const moduleName = match?.[1] ?? 'other';
    byModule.set(moduleName, (byModule.get(moduleName) ?? 0) + 1);
  }

  return byModule;
}

/* ------------------------------------------------------------------ *
 * 3. Fold both into a per-module, per-task picture.
 * ------------------------------------------------------------------ */

interface TaskProgress {
  title: string;
  passed: number;
  total: number;
}

interface ModuleProgress {
  id: string;
  label: string;
  passed: number;
  total: number;
  typeErrors: number;
  loadError: string | null;
  tasks: TaskProgress[];
}

function moduleOf(filePath: string): string | null {
  const rel = relative(root, filePath).split(sep).join('/');
  return /^src\/(m\d\d-[a-z0-9-]+)\//.exec(rel)?.[1] ?? null;
}

function collect(tests: VitestJson, typeErrors: Map<string, number>): ModuleProgress[] {
  const modules = new Map<string, ModuleProgress>();

  const ensure = (id: string): ModuleProgress => {
    let found = modules.get(id);
    if (found === undefined) {
      found = {
        id,
        label: id.replace(/^m\d\d-/, ''),
        passed: 0,
        total: 0,
        typeErrors: typeErrors.get(id) ?? 0,
        loadError: null,
        tasks: [],
      };
      modules.set(id, found);
    }
    return found;
  };

  // Seed every module that has type errors, even if its tests never ran.
  for (const id of typeErrors.keys()) {
    if (id !== 'other') ensure(id);
  }

  for (const file of tests.testResults) {
    const id = moduleOf(file.name);
    if (id === null) continue;
    const entry = ensure(id);

    if (file.assertionResults.length === 0 && file.status === 'failed') {
      // The file did not even import - usually a syntax error or a stub that
      // throws at module scope.
      entry.loadError = (file.message ?? 'file failed to load').split('\n')[0] ?? null;
    }

    const byTask = new Map<string, TaskProgress>();
    for (const assertion of file.assertionResults) {
      const title = assertion.ancestorTitles[0] ?? assertion.title;
      let task = byTask.get(title);
      if (task === undefined) {
        task = { title, passed: 0, total: 0 };
        byTask.set(title, task);
        entry.tasks.push(task);
      }
      task.total += 1;
      entry.total += 1;
      if (assertion.status === 'passed') {
        task.passed += 1;
        entry.passed += 1;
      }
    }
  }

  return [...modules.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/* ------------------------------------------------------------------ *
 * 4. Render.
 * ------------------------------------------------------------------ */

const BAR_WIDTH = 12;

function bar(passed: number, total: number): string {
  const ratio = total === 0 ? 0 : passed / total;
  const filled = Math.round(ratio * BAR_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

function percent(passed: number, total: number): string {
  const ratio = total === 0 ? 0 : passed / total;
  return `${String(Math.round(ratio * 100)).padStart(3)}%`;
}

function isDone(module: ModuleProgress): boolean {
  return module.total > 0 && module.passed === module.total && module.typeErrors === 0;
}

function printConsole(modules: ModuleProgress[]): void {
  const totalPassed = modules.reduce((sum, m) => sum + m.passed, 0);
  const totalTests = modules.reduce((sum, m) => sum + m.total, 0);
  const totalTypeErrors = modules.reduce((sum, m) => sum + m.typeErrors, 0);

  const width = 68;
  console.log('');
  console.log('  TypeScript for QA — progress');
  console.log('  ' + '─'.repeat(width));
  console.log(
    '  ' +
      'Module'.padEnd(26) +
      'Progress'.padEnd(BAR_WIDTH + 7) +
      'Tests'.padEnd(11) +
      'Types',
  );
  console.log('  ' + '─'.repeat(width));

  for (const module of modules) {
    const name = `${module.id.slice(1, 3)} ${module.label}`;
    const tests = `${module.passed}/${module.total}`;
    const types =
      module.typeErrors === 0 ? 'ok' : `${module.typeErrors} error${module.typeErrors === 1 ? '' : 's'}`;
    const mark = isDone(module) ? ' ✓' : '';
    console.log(
      '  ' +
        name.padEnd(26) +
        `${bar(module.passed, module.total)} ${percent(module.passed, module.total)}  ` +
        tests.padEnd(11) +
        types +
        mark,
    );
  }

  console.log('  ' + '─'.repeat(width));
  console.log(
    '  ' +
      'TOTAL'.padEnd(26) +
      `${bar(totalPassed, totalTests)} ${percent(totalPassed, totalTests)}  ` +
      `${totalPassed}/${totalTests}`.padEnd(11) +
      (totalTypeErrors === 0 ? 'ok' : `${totalTypeErrors} errors`),
  );
  console.log('');

  const next = modules.find((module) => !isDone(module));
  if (next === undefined) {
    console.log('  Everything is green. Go and read solutions/ — the comments are the point.');
  } else {
    const task = next.tasks.find((t) => t.passed < t.total);
    const hint =
      task === undefined
        ? `${next.typeErrors} type error(s) — run \`npm run typecheck\``
        : `${task.title} (${task.total - task.passed} failing)`;
    console.log(`  Next up  →  ${next.id}  ·  ${hint}`);
    console.log(`  Run      →  npx vitest run src/${next.id}`);
  }
  console.log('');
}

function writeMarkdown(modules: ModuleProgress[]): void {
  const totalPassed = modules.reduce((sum, m) => sum + m.passed, 0);
  const totalTests = modules.reduce((sum, m) => sum + m.total, 0);
  const totalTypeErrors = modules.reduce((sum, m) => sum + m.typeErrors, 0);
  const done = modules.filter(isDone).length;

  const lines: string[] = [
    '# Progress',
    '',
    '<!-- Generated by `npm run progress`. Do not edit by hand. -->',
    '',
    `**${totalPassed} / ${totalTests} tests passing** · ` +
      `**${done} / ${modules.length} modules complete** · ` +
      `${totalTypeErrors === 0 ? 'no type errors' : `${totalTypeErrors} type errors`}`,
    '',
    '```',
    `${bar(totalPassed, totalTests)} ${percent(totalPassed, totalTests)}`,
    '```',
    '',
    `_Last run: ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC_`,
    '',
    '| Module | Tests | Types | Done |',
    '| --- | --- | --- | :-: |',
  ];

  for (const module of modules) {
    lines.push(
      `| [${module.id}](src/${module.id}/README.md) | ${module.passed}/${module.total} | ` +
        `${module.typeErrors === 0 ? '—' : `${module.typeErrors}`} | ${isDone(module) ? '✅' : ''} |`,
    );
  }

  lines.push('', '## Task by task', '');

  for (const module of modules) {
    lines.push(`### ${module.id} — ${module.passed}/${module.total}`);
    lines.push('');
    if (module.loadError !== null) {
      lines.push(`> \`${module.loadError}\``);
      lines.push('');
    }
    if (module.tasks.length === 0) {
      lines.push('_No tests reported for this module._');
    } else {
      for (const task of module.tasks) {
        const box = task.passed === task.total ? 'x' : ' ';
        lines.push(`- [${box}] ${task.title} — ${task.passed}/${task.total}`);
      }
    }
    if (module.typeErrors > 0) {
      lines.push(`- [ ] type checks — ${module.typeErrors} error(s) (\`npm run typecheck\`)`);
    }
    lines.push('');
  }

  writeFileSync(join(root, 'PROGRESS.md'), lines.join('\n'));
}

/* ------------------------------------------------------------------ */

const tests = runTests();
const typeErrors = runTypecheck();
const modules = collect(tests, typeErrors);

printConsole(modules);
writeMarkdown(modules);
rmSync(jsonPath, { force: true });

console.log('  PROGRESS.md updated.');
console.log('');
