import type { WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { expect } from 'chai';
import {
  filterWarpRoutesIds,
  parseWarpRouteConfigId,
  warpRouteConfigPathToId,
} from '../../src/registry/warp-utils.js';
import { BaseRegistry } from '../../src/registry/BaseRegistry.js';
const WARP_ROUTE_ID = 'USDT/arbitrum-ethereum';

describe('Warp utils', () => {
  it('Computes a warp ID from a config path', () => {
    expect(warpRouteConfigPathToId('warp_routes/USDT/arbitrum-ethereum-config.yaml')).to.eql(
      WARP_ROUTE_ID,
    );
  });
  it('Computes a warp ID from a config', () => {
    const mockConfig = {
      tokens: [
        { chainName: 'ethereum', symbol: 'USDT', standard: 'EvmHypCollateral' },
        { chainName: 'arbitrum', symbol: 'USDT', standard: 'EvmHypCollateral' },
      ],
    } as WarpCoreConfig;
    expect(BaseRegistry.warpRouteConfigToId(mockConfig)).to.eql(WARP_ROUTE_ID);
  });
  it('Parses a warp ID', () => {
    expect(parseWarpRouteConfigId(WARP_ROUTE_ID)).to.eql({
      tokenSymbol: 'USDT',
      label: ['arbitrum', 'ethereum'].join('-'),
    });
  });
  it('Filters warp route ID maps', () => {
    const idMap = { [WARP_ROUTE_ID]: 'path' };
    expect(filterWarpRoutesIds(idMap).ids.length).to.eql(1);
    expect(filterWarpRoutesIds(idMap, { label: 'fakechain' }).ids.length).to.eql(0);
    expect(filterWarpRoutesIds(idMap, { symbol: 'fakesymbol' }).ids.length).to.eql(0);
  });
});
