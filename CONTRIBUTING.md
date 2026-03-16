# Contributing to registrie

Thanks for your interest in contributing.

## Reporting bugs

Open an issue at [github.com/HigumaSoft/registrie/issues](https://github.com/HigumaSoft/registrie/issues).

Include:
- Package version
- TypeScript/Node version
- Minimal reproduction case
- Expected vs actual behavior

## Suggesting changes

Open an issue before opening a PR for anything beyond small bug fixes. This avoids wasted effort if the change doesn't fit the project direction.

## Development setup

```bash
git clone https://github.com/HigumaSoft/registrie.git
cd registrie
npm install
```

Run tests:
```bash
npm test
```

Run lint:
```bash
npm run lint
```

Build:
```bash
npm run build
```

## Making changes

- All changes must have tests
- All tests must pass: `npm test`
- Lint must be clean: `npm run lint`
- Keep PRs focused — one fix or feature per PR

## Releasing

Releases are handled by the maintainer using [changesets](https://github.com/changesets/changesets). You do not need to bump versions in PRs.