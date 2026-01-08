# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Hyperlane Registry is a TypeScript library that provides configs, artifacts, and schemas for the Hyperlane interchain communication protocol. It serves as a central source of truth for chain metadata, deployment addresses, and warp route configurations used by Hyperlane tooling (Explorer, CLI).

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
