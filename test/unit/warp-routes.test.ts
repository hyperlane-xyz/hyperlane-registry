import { expect } from 'chai';

import {
  MultiProtocolProvider,
  TokenStandard,
  WarpCore,
  WarpRouteDeployConfigSchema,
} from '@hyperlane-xyz/sdk';
import { FileSystemRegistry } from '../../src/registry/FileSystemRegistry.js';
import { createWarpRouteConfigId, parseWarpRouteConfigId } from '../../src/registry/warp-utils.js';
import path from 'path';
import fs from 'fs';

const BASE_URI = './';
describe('Warp Core Configs', () => {
  const localRegistry = new FileSystemRegistry({ uri: BASE_URI });
  const chainMetadata = localRegistry.getMetadata();
  const multiProvider = new MultiProtocolProvider(chainMetadata);
  const routes = localRegistry.getWarpRoutes();

  for (const id of Object.keys(routes)) {
    it(`WarpCore ${id} is valid`, async () => {
      const config = routes[id];
      // WarpCore will validate the config
      const warpCore = WarpCore.FromConfig(multiProvider, config);
      expect(warpCore).to.be.an.instanceOf(WarpCore);
      expect(warpCore.tokens.length).to.be.greaterThan(0);
    });

    it(`WarpCore ${id} has valid chain names`, () => {
      const { chainNames } = parseWarpRouteConfigId(id);

      // Verify each chain exists in registry
      for (const chain of chainNames) {
        expect(localRegistry.getChainMetadata(chain), `Chain ${chain} not found in registry`).to.not
          .be.null;
      }
    });

    it(`WarpCore ${id} has chain names in alphabetical order`, () => {
      const { chainNames } = parseWarpRouteConfigId(id);

      // Verify chains are in alphabetical order
      const sortedChains = [...chainNames].sort();
      expect(chainNames).to.deep.equal(sortedChains, 'Chain names must be in alphabetical order');
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

    it(`WarpCore ${id} matches derived id from config`, () => {
      // Skip check on TIA/forma-stride to avoid breaking changes to forma
      if (id === 'TIA/forma-stride') {
        return;
      }

      // Get the symbol and chain names from the config
      const config = routes[id];
      const { chainNames } = parseWarpRouteConfigId(id);

      // Create the ID from the config
      const symbol = config.tokens[0].symbol;
      const tokenChains = [...new Set(config.tokens.map((token) => token.chainName))];
      const derivedId = createWarpRouteConfigId(symbol, tokenChains);
      const { chainNames: derivedChainNames } = parseWarpRouteConfigId(derivedId);

      // Verify the chain names match
      expect(chainNames).to.deep.equal(
        derivedChainNames,
        'Chain names in ID must match derived chain names',
      );
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
            TokenStandard.EvmHypSynthetic,
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
    'stTIA/eclipsemainnet-stride'
  ];
  const configs = Object.keys(warpDeploys).filter(id =>!excludeIds.includes(id));
  for (const id of configs) {
    it(`Deploy config ${id} is valid`, async () => {
      WarpRouteDeployConfigSchema.parse(warpDeploys[id]);
    });
  }
})
