import { GithubRegistry } from '../src/registry/GithubRegistry';

async function main() {
  const registry = new GithubRegistry();

  const warpRoutes = await registry.getWarpRoutes();

  console.log('warpRoutes', warpRoutes);
}

main();
