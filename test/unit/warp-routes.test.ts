import { expect } from 'chai';

import { MultiProtocolProvider, WarpCore } from '@hyperlane-xyz/sdk';
import { FileSystemRegistry } from '../../src/registry/FileSystemRegistry.js';

describe('Warp Route Configs', () => {
  const localRegistry = new FileSystemRegistry({ uri: './' });
  const chainMetadata = localRegistry.getMetadata();
  const multiProvider = new MultiProtocolProvider(chainMetadata);
  const routes = localRegistry.getWarpRoutes();

  for (const id of Object.keys(routes)) {
    it(`Route ${id} is valid`, async () => {
      const config = routes[id];
      // WarpCore will validate the config
      const warpCore = WarpCore.FromConfig(multiProvider, config);
      expect(warpCore).to.be.an.instanceOf(WarpCore);
      expect(warpCore.tokens.length).to.be.greaterThan(0);
    });
  }
});
