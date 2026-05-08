# CLAUDE.md

## Project overview

`@byloth/core` is a personal, **dependency-free** TypeScript utility library — a curated collection of functions and classes (math helpers, iterators, promises, timers, callbacks, exceptions, JSON storage, …) that the author reuses across all his projects.

It's an **incremental library**: it grew over ~10 years from informal copy-paste between projects into a single TS package. Several constructs are inspired by other languages (notably **Python**) and re-implemented in JS/TS for ergonomics. Many features overlap with what `lodash` / `underscore` / similar libraries offer — using a custom library is a deliberate choice: zero third-party deps, total ownership of the behavior, no risk of upstream abandonment, and the joy of "reinventing the wheel" while learning. **Don't suggest replacing internal utilities with external packages.**

The package ships both ESM and CJS, exposes types from `src/`, and is published to npm as `@byloth/core` and to GitHub Packages.

## Layout

```
src/
├── index.ts             # single public barrel — every export the package ships goes through here
├── helpers.ts           # tiny env-detection constants (isBrowser, isNode, isWorker)
├── core/                # foundational types
├── models/              # classes (callbacks, collections, iterators, promises, timers, exceptions, json, aggregators)
└── utils/               # standalone functions (math, iterator, date, string, dom, async, random, curve)
tests/                   # mirrors src/ structure; vitest tests with .test.ts suffix
```

Each subfolder has its own `index.ts` barrel that re-exports its public surface. The root `src/index.ts` re-exports from those.

## Commands

```sh
pnpm run test           # vitest run — always use this, NOT `npx vitest`
pnpm run typecheck      # tsc (no emit)
pnpm run lint --fix     # eslint . --fix
pnpm run build          # vite build (produces dist/)
```

**Final checks after every code change** — run all three and make sure they pass before reporting the task as done:

```sh
pnpm run test
pnpm run typecheck
pnpm run lint --fix
```

## Code style

The codebase has a very specific, consistent style. Match it exactly when adding or modifying code.

### Formatting

- **4-space indentation**. Always.
- **Allman braces**: `{` and `}` on their own lines, including for `if`/`else`/`for`/`while`/`try`/single-statement function bodies. One-liner blocks like `if (cond) { return; }` are accepted only when the whole statement is genuinely trivial.
- Double quotes for strings.
- Trailing semicolons.
- One blank line between logically distinct blocks inside a function; multi-block class members are separated by a blank line.
- Use `_` prefix for local helpers and locally-shadowed names (e.g. `_sum`, `_index`, `_callback`) to disambiguate from parameters/imports.
- Numeric literals use `_` separators when large (`5_000`).

### TypeScript

- `import type { … }` for type-only imports — `verbatimModuleSyntax` is on, so this is enforced.
- Imports always end in `.js` (NodeNext resolution), even though sources are `.ts`.
- `strict` + `noImplicitOverride` + `noImplicitReturns` are on. Use `public override` / `protected override` consistently.
- Visibility modifiers are explicit: `public`, `protected`, `private` — never rely on the default.
- Class fields are declared with their visibility and (when not assigned in the declaration) a backing `_field` convention; pair with `public get field()` for readonly exposure (see `SwitchableCallback._isEnabled` / `isEnabled`).
- Every class sets `[Symbol.toStringTag]` to its own name (via `public readonly` or `public override readonly`).
- Generics use single-letter params (`T`, `K`, `V`) with a `@template` JSDoc entry.
- Avoid `any`; when truly needed, disable the rule with an inline `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment scoped to the line.

### Modules and exports

- One primary class per file, exported as `export default`. The folder's `index.ts` re-exports it as a named export: `export { default as Foo } from "./foo.js";`.
- Standalone utility functions are `export function …` (named) and grouped by topic in `src/utils/<topic>.ts`.
- Anything intended to be public **must** be re-exported from `src/index.ts`. Types live in a separate `export type { … }` block.

## JSDoc style

Every public class, method, function, and notable field carries a JSDoc block. The format is rigid — match it exactly:

```ts
/**
 * One-line summary, ending with a period.
 *
 * Optional further paragraph describing behavior, with two trailing spaces
 * for hard line-breaks within the same paragraph.  
 * Like this.
 *
 * Also note that:
 * - Bullet for an edge case or a thrown exception.
 * - Another bullet — link cross-references with `{@link Foo}` / `{@link Foo.bar}`.
 *
 * ---
 *
 * @example
 * ```ts
 * const x = doSomething(42);
 * ```
 *
 * ---
 *
 * @template T A short description of the generic parameter.
 *
 * @param foo What `foo` is.
 * @param bar What `bar` is.
 *
 * @returns What the function returns.
 */
```

Conventions:

- **`---` separators** are used to visually delimit the prose summary, the `@example` block, and the `@param`/`@returns` block. Most public APIs include all three sections.
- Two trailing spaces (`  `) at end of line produce hard line-breaks inside paragraphs — used liberally in this codebase.
- Cross-reference exceptions and other classes with `{@link KeyException}`, `{@link SwitchableCallback.key}`, etc.
- Constructors get their own JSDoc; **overloaded** constructors/methods get one JSDoc block per overload signature, plus the implementation signature with no JSDoc (see `SwitchableCallback` constructor and `reset` for the canonical example).
- Code in `@example` blocks uses `[...]` as a placeholder for omitted code.
- Keep the voice instructional and consistent: "Initializes a new instance of the …", "Returns …", "Throws … when …".

## Exceptions

The library defines its own `Exception` hierarchy in `src/models/exceptions/` (rooted at `Exception extends Error`). When you need to throw, **always** use the most specific exception from this hierarchy — never `throw new Error(…)`. Common ones:

- `ValueException` — invalid argument value (and its subclass `RangeException`).
- `TypeException` — wrong argument type.
- `KeyException` — missing/duplicate key in a map-like structure.
- `RuntimeException` — unexpected runtime state.
- `ReferenceException` — `null`/`undefined` where an object was expected.
- `NotImplementedException` — placeholder for an unreachable / not-yet-implemented path.

Each subclass takes `(message, cause?, name?)` and forwards to `super`. New exceptions follow the same constructor shape.

## Tests

- Tests live under `tests/` mirroring `src/` (e.g. `src/utils/math.ts` → `tests/utils/math.test.ts`).
- Use **vitest**: `import { describe, expect, it, vi } from "vitest";`.
- Import the things being tested from `../../src/index.js` (the public barrel) — not from internal paths. This guarantees the public surface stays correct.
- Top-level `describe` per class or per function. Test titles start with `"Should …"`.
- Group happy-path tests first, error-path tests after. Separate the two groups with a blank line.
- Use `vi.fn(...)` for callback mocks. Local helpers in tests use `_` prefix (e.g. `_callback`, `_newPoint`).
- For each public method, cover: nominal behavior, every branch that throws (one `it` per exception type/condition), and any state-mutation invariants.

## Behavioral conventions

- Methods that mutate a single piece of state and have a clear precondition (e.g. `enable`, `disable`) **throw** when called in the wrong state rather than silently no-op'ing.
- Public state is exposed via a `get` accessor backed by a protected `_field`; the protected field is the only way derived classes mutate it.
- Constructor overloads with progressively more arguments are common: a no-arg overload + a fully-specified overload, sharing a single implementation signature with optional params.
- When a feature is added that "resets" or "reinitializes" an object, it should mirror the constructor's overloads exactly (see `SwitchableCallback.reset`).
- Module-level non-exported `const`s are used for shared internal stubs (e.g. `Disabler`, `NotImplemented` in `switchable-callback.ts`) — prefer hoisting these out of constructors/methods rather than redeclaring them inline.

## Don'ts

- Don't add third-party runtime dependencies. Zero deps is a feature.
- Don't suggest replacing internal utilities with `lodash`, `underscore`, `date-fns`, etc. — using a hand-rolled equivalent is intentional.
- Don't use `null` for "no value" — the codebase uses `undefined` and optional params.
- Don't introduce ad-hoc error types — use and extend (if necessary) the existing `Exception` hierarchy.
- Don't break the `src/index.ts` barrel — every new public symbol must be exported there.
