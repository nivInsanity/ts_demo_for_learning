# Two things to do first

Everything else in this folder is ready to run. These two steps could not be
done for you, because the tooling that wrote these files is not allowed to
touch `.git/` or `.github/` on your machine.

## 1. Make this a git repository

```bash
cd "C:\Users\barzi\Desktop\ts demo"
git init -b main
git add -A
git commit -m "TypeScript for QA Automation: 13-module exercise repo"
```

Then, once you have made an empty repo on GitHub:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`node_modules/`, `.verify/` and the scratch files are already covered by
`.gitignore`, so `git add -A` is safe.

A ready-made repository with this exact commit also came through the chat as
`ts-qa-bootcamp.bundle`. If you would rather start from that:

```bash
git clone ts-qa-bootcamp.bundle ts-qa-bootcamp
```

It contains the same files plus the CI workflow already in place.

## 2. Turn on CI (optional)

Copy [`docs/ci-workflow.yml`](docs/ci-workflow.yml) to
`.github/workflows/ci.yml`:

```bash
mkdir -p .github/workflows
cp docs/ci-workflow.yml .github/workflows/ci.yml
```

Then update the badge URL at the top of `README.md` — replace `OWNER/REPO`
with your GitHub path. The workflow runs `typecheck`, `test` and `progress`
on every push, and deliberately never fails the build: a red X on an
exercise repo tells you nothing you did not already know.

## 3. Start

```bash
npm install
npm run progress
```

Then open [`src/m01-types-and-inference/README.md`](src/m01-types-and-inference/README.md).
