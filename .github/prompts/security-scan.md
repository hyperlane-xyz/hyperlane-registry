## Registry Security Focus Areas

This is a chain metadata registry. Pay special attention to:

### YAML Injection & Parsing

- Unsafe YAML parsing (anchors, aliases, merge keys)
- Prototype pollution via YAML deserialization
- Anchor abuse in chain metadata or warp route configs
- Check: yaml library version, safe parsing flags

### Schema Validation Bypass

- Zod schema validation gaps (chainId, RPC URLs, addresses)
- Type confusion in TypeScript parsing
- Missing validation on optional fields
- Check: schema definitions in src/registry/

### Config Secrets & Supply Chain

- Hardcoded API keys, private keys in metadata files
- Malicious RPC URLs in chain configs
- Compromised chain metadata or warp route definitions
- Check: chains/_.yaml, deployments/warp_routes/_.yaml

### Path Traversal & File Operations

- Unsafe file path construction in registry code
- Directory traversal in YAML file loading
- Check: src/fs/ Node.js-specific code

### Build Script Injection

- Code injection via YAML to JSON to TypeScript build pipeline
- Unsafe string interpolation in generated code
- Check: build scripts parsing YAML into TypeScript exports
