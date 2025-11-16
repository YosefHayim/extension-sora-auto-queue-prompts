# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains the browser extension source (UI components, background/content scripts, hooks, and utilities). Keep new code under coherent subfolders (`src/components`, `src/features`, `src/lib`, etc.).
- `tests/` holds Jest + Testing Library tests. Mirror the `src/` structure where possible.
- `logs/` is for runtime or debug output and should not be relied on for source of truth.
- Root configuration files (`package.json`, `tsconfig.json`, `jest.config.js`, `pnpm-workspace.yaml`) define TypeScript, testing, and build behavior.

## Build, Test, and Development Commands

- `pnpm dev` – Run the Plasmo development server for local extension preview.
- `pnpm build` – Produce a production build.
- `pnpm package` – Build a browser-installable extension package.
- `pnpm test` / `pnpm test:watch` – Run Jest test suite (once / in watch mode).
- `pnpm test:coverage` – Run tests and enforce coverage thresholds.

## Coding Style & Naming Conventions

- Language: TypeScript + React with strict compiler options.
- Indentation: 2 spaces; prefer small, pure functions and functional components.
- Naming: `PascalCase` for React components, `camelCase` for variables/functions, `SCREAMING_SNAKE_CASE` for constants.
- Imports: Use the `~` alias for root-relative paths when appropriate; keep imports sorted (Prettier + `@plasmohq/prettier-plugin-sort-imports`).
- Run Prettier before committing (for example: `pnpm exec prettier "src/**/*.{ts,tsx}" --write`).

## Testing Guidelines

- Framework: Jest (`ts-jest` preset) with `jsdom` environment and Testing Library.
- Test locations: Under `tests/` or alongside code using `*.test.tsx` / `*.spec.tsx`.
- Aim to maintain or improve the global coverage threshold (70% for branches, functions, lines, and statements).
- Prefer RTL-style tests: assert on user-visible behavior, not implementation details.

## Commit & Pull Request Guidelines

- Commit messages: short, imperative, and descriptive (e.g., `Add postinstall script for sharp`, `Fix import sorting config`).
- Keep commits focused and logically grouped (code + tests + docs together).
- Pull requests should include: a clear summary, any related issue links, notes on testing (`pnpm test`, `pnpm build`), and screenshots/GIFs for UI changes.
- For permission or manifest changes, call them out explicitly and justify the scope.

