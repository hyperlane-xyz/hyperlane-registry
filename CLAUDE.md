# CLAUDE.md

**Be extremely concise. Sacrifice grammar for concision. Terse responses preferred. No fluff.**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Hyperlane Registry is a TypeScript library that provides configs, artifacts, and schemas for the Hyperlane interchain communication protocol. It serves as a central source of truth for chain metadata, deployment addresses, and warp route configurations used by Hyperlane tooling (Explorer, CLI).

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## Common Commands

```bash
# Build (runs build.ts script then TypeScript compilation)
pnpm run build

# Lint (checks src/, chains/, and deployments/ directories)
pnpm run lint
pnpm run lint:fix

# Format YAML and other files
pnpm run prettier

# Run unit tests (requires build first)
pnpm run test:unit

# Run a single test file
pnpm run build && mocha --require dotenv/config --config .mocharc.json './test/unit/<filename>.test.ts' --exit

# RPC health checks
pnpm run test:rpc-health-mainnet
pnpm run test:rpc-health-testnet
```

## Architecture

### Data Structure

- **chains/**: One directory per chain containing:

  - `metadata.yaml` - Chain metadata (chainId, RPC URLs, block explorers, native token)
  - `addresses.yaml` - Deployed contract addresses (mailbox, ISM factories, hooks)
  - `logo.svg` - Chain logo

- **deployments/warp_routes/**: Warp route token configurations organized by token symbol
  - `{chains}-config.yaml` - Warp core config for token routes
  - `{chains}-deploy.yaml` - Deployment config

### Registry Classes (src/registry/)

The library exports multiple registry implementations:

- `IRegistry` - Interface defining all registry operations
- `BaseRegistry` - Abstract base with caching and common logic
- `GithubRegistry` - Fetches from GitHub raw URLs
- `FileSystemRegistry` (src/fs/) - Local filesystem operations
- `HttpClientRegistry` - Generic HTTP client implementation
- `MergedRegistry` - Combines multiple registries
- `PartialRegistry` - Partial implementation wrapper

### Build Process (scripts/build.ts)

1. Copies `src/` to `tmp/` directory
2. Parses all chain YAML files into JSON and TypeScript exports
3. Generates combined `chains/metadata.yaml` and `chains/addresses.yaml` files
4. Parses warp route configs and generates TypeScript exports
5. Updates JSON schemas from Zod definitions
6. TypeScript compiles from `tmp/` to `dist/`

### Key Exports

The package exports chain metadata, addresses, and warp route configs in multiple formats:

- Individual chain imports: `@hyperlane-xyz/registry/chains/{chainName}`
- Combined maps: `chainMetadata`, `chainAddresses`, `warpRouteConfigs`
- Registry classes for programmatic access

## Important Patterns

- YAML files must have keys sorted alphabetically (enforced by ESLint)
- Warp route IDs follow format: `{SYMBOL}/{label}` where label is typically chain names joined by `-`
- The `src/fs/` module contains Node.js-specific code and is isolated to prevent bundling issues
- No Node.js imports allowed in main `src/` files (except `src/fs/`)
- Pre-commit hooks run prettier and eslint on staged files

## Dependencies

- `@hyperlane-xyz/sdk` - Hyperlane SDK types (ChainMetadata, WarpCoreConfig)
- `@hyperlane-xyz/utils` - Utility functions and ESLint plugin for YAML sorting
- `zod` - Schema validation
- `yaml` - YAML parsing/serialization

## Engineering Philosophy

### Keep It Simple

We handle ONLY the most important cases. Don't add functionality unless it's small or absolutely necessary.

### Error Handling

- **Expected issues** (external systems, user input): Use explicit error handling, try/catch at boundaries
- **Unexpected issues** (invalid state, broken invariants): Fail loudly with `throw` or `console.error`
- **NEVER** add silent fallbacks for unexpected issues - they mask bugs

### Backwards-Compatibility

| Change Location    | Backwards-Compat? | Rationale                                |
| ------------------ | ----------------- | ---------------------------------------- |
| Local/uncommitted  | No                | Iteration speed; no external impact      |
| In main unreleased | Preferred         | Minimize friction for other developers   |
| Released           | Required          | Prevent breaking downstream integrations |

## Tips for Claude Code Sessions

1. **Run tests incrementally** - `pnpm run build && mocha` for specific test files
2. **Check existing patterns** - Search codebase for similar implementations
3. **YAML keys alphabetical** - ESLint enforces sorted keys in YAML files
4. **Registry is source of truth** - Chain metadata, addresses, warp routes all here
5. **Keep changes minimal** - Only modify what's necessary; avoid scope creep
6. **No Node.js in main src/** - Only `src/fs/` can import Node.js modules
7. **Warp ID format** - Must be `{SYMBOL}/{label}`, e.g., `USDC/ethereum-arbitrum`
8. **Address provenance** - When adding/changing addresses, note the source (PR, tx hash)
9. **Deterministic ordering** - Sort arrays/maps before processing for consistent output
10. **Changesets** - Include changeset files for version-bumped changes

## Verify Before Acting

**Always search the codebase before assuming.** Don't hallucinate file paths, function names, or patterns.

- `grep` or search before claiming "X doesn't exist"
- Read the actual file before suggesting changes to it
- Check `git log` or blame before assuming why code exists
- Verify imports exist in `package.json` before using them

## When Claude Gets It Wrong

If output seems wrong, check:

1. **Did I read the actual file?** Or did I assume its contents?
2. **Did I search for existing patterns?** The codebase likely has examples
3. **Am I using stale context?** Re-read files that may have changed
4. **Did I verify the error message?** Run the command and read actual output
