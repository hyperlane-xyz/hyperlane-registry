import { expect } from 'chai';

import {
  MultiProtocolProvider,
  TokenStandard,
  WarpCore,
  WarpRouteDeployConfigSchema,
} from '@hyperlane-xyz/sdk';
import { FileSystemRegistry } from '../../src/fs/FileSystemRegistry.js';
import path from 'path';
import fs from 'fs';
import { WARP_ROUTE_SYMBOL_DIRECTORY_REGEX } from '../../src/consts.js';

const BASE_URI = './';

describe('Warp Core Configs', () => {
  const localRegistry = new FileSystemRegistry({ uri: BASE_URI });
  const chainMetadata = localRegistry.getMetadata();
  const multiProvider = new MultiProtocolProvider(chainMetadata);
  const routes = localRegistry.getWarpRoutes();

  it('All warp route symbol directories meet regex requirement', () => {
    const warpRoutesPath = path.join(BASE_URI, 'deployments', 'warp_routes');
    const symbolDirs = fs
      .readdirSync(warpRoutesPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      // Convert to a path within the deployments directory, as expected by the regex
      .map((entry) => path.join('warp_routes', entry.name));

    for (const symbolDir of symbolDirs) {
      expect(
        WARP_ROUTE_SYMBOL_DIRECTORY_REGEX.test(symbolDir),
        `Symbol directory ${symbolDir} does not meet expected regex`,
      ).to.be.true;
    }
  });

  for (const id of Object.keys(routes)) {
    it(`WarpCore ${id} is valid`, async () => {
      const config = routes[id];
      // WarpCore will validate the config
      const warpCore = WarpCore.FromConfig(multiProvider, config);
      expect(warpCore).to.be.an.instanceOf(WarpCore);
      expect(warpCore.tokens.length).to.be.greaterThan(0);
    });

    it(`WarpCore ${id} has valid token logoURIs`, () => {
      const config = routes[id];
      config.tokens.forEach((token) => {
        if (token.logoURI) {
          expect(
            fs.existsSync(path.join(BASE_URI, token.logoURI)),
            `Logo file ${token.logoURI} not found`,
          ).to.be.true;
        }
      });
    });

    it(`WarpCore ${id} tokens has consistent logoURI presence`, () => {
      const config = routes[id];
      let foundLogoURI = 0;
      config.tokens.forEach((token) => {
        if (token.logoURI) {
          foundLogoURI++;
        }
      });

      expect(
        foundLogoURI === 0 || foundLogoURI === config.tokens.length,
        `Tokens must all or none have logoURI. Found ${foundLogoURI} with logoURI out of ${config.tokens.length}`,
      ).to.be.true;
    });

    it(`WarpCore ${id} only specifies a coinGeckoId for tokens that escrow tokens`, () => {
      const config = routes[id];

      const warpCore = WarpCore.FromConfig(multiProvider, config);

      for (const token of warpCore.tokens) {
        if (token.coinGeckoId === undefined) {
          continue;
        }
        // TODO add TOKEN_SYNTHETIC_STANDARDS list to SDK.
        // At the moment, the SDK doesn't have a super clean way to determine
        // if a token is synthetic, so we have a list here for now.
        expect(
          ![
            TokenStandard.CwHypSynthetic,
            TokenStandard.SealevelHypSynthetic,
            // TODO: re-add after updating sdk with the latest version
            // TokenStandard.EvmHypSynthetic,
            TokenStandard.EvmHypSyntheticRebase,
            TokenStandard.EvmHypXERC20,
          ].includes(token.standard),
          `Token standard ${token.standard} should not have a coinGeckoId`,
        ).to.be.true;
      }
    });
  }
});

describe('Warp Deploy Configs', () => {
  const localRegistry = new FileSystemRegistry({ uri: BASE_URI });
  const warpDeploys = localRegistry.getWarpDeployConfigs();

  // These Ids do not validate due to owner
  // Remove after https://github.com/hyperlane-xyz/hyperlane-monorepo/issues/5292
  const excludeIds = [
    'ECLIP/arbitrum-neutron',
    'INJ/inevm-injective',
    'TIA/arbitrum-neutron',
    'INJ/inevm-injective',
    'TIA/arbitrum-neutron',
    'TIA/eclipsemainnet-stride',
    'TIA/mantapacific-neutron',
    'stTIA/eclipsemainnet-stride',
  ];
  const configs = Object.keys(warpDeploys).filter((id) => !excludeIds.includes(id));
  for (const id of configs) {
    it(`Deploy config ${id} is valid`, async () => {
      WarpRouteDeployConfigSchema.parse(warpDeploys[id]);
    });
  }
});
