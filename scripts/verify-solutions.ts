/**
 * Maintainer script - you do not need this to learn TypeScript.
 *
 * It proves that every reference solution in `solutions/` actually satisfies
 * the test suite in `src/`. It does that by building a throwaway copy of the
 * repo in `.verify/`, overlaying the solutions on top of the exercise files,
 * and running Vitest against the copy. Nothing in `src/` is touched.
 *
 *   npm run solutions:verify
 *   npm run solutions:verify -- m07        # one module
 */

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verifyDir = join(root, '.verify');
const filter = process.argv[2];

rmSync(verifyDir, { recursive: true, force: true });
mkdirSync(verifyDir, { recursive: true });

// 1. A pristine copy of the exercises (tests included).
cpSync(join(root, 'src'), join(verifyDir, 'src'), { recursive: true });

// 2. Overlay the solutions. `solutions/<module>/x.ts` replaces
//    `.verify/src/<module>/x.ts`, so the untouched test files now import
//    working implementations.
const solutionsDir = join(root, 'solutions');
const overlaid: string[] = [];

for (const moduleName of readdirSync(solutionsDir)) {
  if (filter && !moduleName.startsWith(filter)) continue;
  const from = join(solutionsDir, moduleName);
  const to = join(verifyDir, 'src', moduleName);
  if (!existsSync(to)) {
    console.error(`solutions/${moduleName} has no matching src/${moduleName}`);
    process.exit(1);
  }
  cpSync(from, to, { recursive: true });
  overlaid.push(moduleName);
}

console.log(`Overlaid ${overlaid.length} module(s): ${overlaid.join(', ')}`);

// 3. A config that points Vitest at the copy.
writeFileSync(
  join(verifyDir, 'vitest.verify.config.ts'),
  `import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    root: '${verifyDir.replace(/\\/g, '/')}',
    include: [${filter ? `'src/${filter}*/**/*.test.ts'` : `'src/**/*.test.ts'`}],
    environment: 'node',
    testTimeout: 15000,
  },
});
`,
);

// 4. Typecheck the overlaid copy. This is the half that `npm test` cannot
//    do: it proves the reference solutions also satisfy the `@ts-expect-error`
//    and `Expect<Equal<...>>` assertions embedded in the test files.
writeFileSync(
  join(verifyDir, 'tsconfig.json'),
  JSON.stringify(
    {
      extends: '../tsconfig.json',
      include: ['src'],
      exclude: [],
    },
    null,
    2,
  ),
);

const tscBin = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
const typecheck = spawnSync(
  process.execPath,
  [tscBin, '--noEmit', '--pretty', 'false', '--project', join(verifyDir, 'tsconfig.json')],
  { encoding: 'utf8', cwd: root },
);

const typeErrors = (typecheck.stdout ?? '')
  .split('\n')
  .filter((line) => line.includes('): error TS'))
  // Only complain about modules we actually overlaid.
  .filter((line) => overlaid.some((moduleName) => line.includes(moduleName)));

if (typeErrors.length > 0) {
  console.error('\nSolutions do not typecheck:\n');
  for (const line of typeErrors) console.error('  ' + line);
} else {
  console.log('Typecheck clean.\n');
}

const vitestBin = join(root, 'node_modules', 'vitest', 'vitest.mjs');
const result = spawnSync(
  process.execPath,
  [vitestBin, 'run', '--config', join(verifyDir, 'vitest.verify.config.ts')],
  { stdio: 'inherit', cwd: root },
);

process.exit(typeErrors.length > 0 ? 1 : (result.status ?? 1));
