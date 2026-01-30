Review this pull request. Focus on:

## Code Quality

- Logic errors and potential bugs
- Error handling and edge cases
- Code clarity and maintainability
- Adherence to existing patterns in the codebase
- **Use existing utilities** - Search codebase before adding new helpers
- **Prefer `??` over `||`** - Preserves zero/empty string as valid values

## Architecture

- Consistency with existing architecture patterns
- Breaking changes or backward compatibility issues
- API contract changes
- **Deduplicate** - Move repeated code/types to shared files
- **Extract utilities** - Shared functions belong in utils packages

## Testing

- Test coverage for new/modified code
- Edge cases that should be tested
- **New utility functions need unit tests**

## Performance

- Gas efficiency (for Solidity changes)
- Unnecessary allocations or computations

## Registry-Specific

- **Warp ID format** - Must be `{SYMBOL}/{label}` (e.g., `USDC/ethereum-arbitrum`)
- **Address provenance** - Note source of address changes (monorepo PR, deployment tx)
- **Changeset required** - Include changeset for version bumps
- **YAML keys alphabetical** - ESLint enforces sorted keys
- **No Node.js in main src/** - Only `src/fs/` can import Node.js modules
- **Deterministic ordering** - Sort arrays/maps before processing

Provide actionable feedback with specific line references.
Be concise. For minor style issues, group them together.
Security issues are handled by a separate dedicated review.
