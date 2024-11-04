import { expect } from 'chai';

import { MultiProtocolProvider, WarpCore } from '@hyperlane-xyz/sdk';
import { FileSystemRegistry } from '../../src/registry/FileSystemRegistry.js';
import { parseWarpRouteConfigId } from '../../src/registry/warp-utils.js';
import path from 'path';
import fs from 'fs';

describe('Warp Route Configs', () => {
  const BASE_URI = './';
  const localRegistry = new FileSystemRegistry({ uri: BASE_URI });
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

    it(`Route ${id} has valid chain names`, () => {
      const { chainNames } = parseWarpRouteConfigId(id);

      // Verify each chain exists in registry
      for (const chain of chainNames) {
        expect(localRegistry.getChainMetadata(chain), `Chain ${chain} not found in registry`).to.not.be.null;
      }
    });

    it(`Route ${id} has chain names in alphabetical order`, () => {
      const { chainNames } = parseWarpRouteConfigId(id);

      // Verify chains are in alphabetical order
      const sortedChains = [...chainNames].sort();
      expect(chainNames).to.deep.equal(sortedChains, 'Chain names must be in alphabetical order');
    });

    it(`Route ${id} has valid token logoURIs`, () => {
      const config = routes[id];
      config.tokens.forEach((token) => {
        if (token.logoURI) {
          expect(fs.existsSync(path.join(BASE_URI, token.logoURI)), `Logo file ${token.logoURI} not found`).to.be.true;
        }
      });
    });
  }
});
