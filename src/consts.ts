export const SCHEMA_REF = '# yaml-language-server: $schema=../schema.json';

export const DEFAULT_GITHUB_REGISTRY = 'https://github.com/hyperlane-xyz/hyperlane-registry';
export const GITHUB_FETCH_CONCURRENCY_LIMIT = 5;

export const CHAIN_FILE_REGEX = /chains\/([a-z0-9]+)\/([a-z]+)\.(yaml|svg)/;
export const WARP_ROUTE_SYMBOL_DIRECTORY_REGEX = /warp_routes\/([a-zA-Z0-9]+)$/;

// Must be some chars (lowercase, uppercase, numbers, ., *) with '/', followed by additional chars with optional '-' separator (e.g. ABC/xyz, ABC/xyz-mno, or USDC.ETH/chain-a-chain-b)
export const WARP_ROUTE_PATTERN = '([a-zA-Z0-9.*]+)/([a-z0-9-]+)';
export const WARP_ROUTE_ID_REGEX = new RegExp(`^${WARP_ROUTE_PATTERN}$`);
export const WARP_ROUTE_CONFIG_FILE_REGEX = new RegExp(
  `warp_routes/${WARP_ROUTE_PATTERN}-config.yaml`,
);
export const WARP_ROUTE_DEPLOY_FILE_REGEX = new RegExp(
  `warp_routes/${WARP_ROUTE_PATTERN}-deploy.yaml`,
);

export const ABACUS_WORKS_DEPLOYER_NAME = 'Abacus Works';
export const PROXY_DEPLOYED_URL = 'https://proxy.hyperlane.xyz';
