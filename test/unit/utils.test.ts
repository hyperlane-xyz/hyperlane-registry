import { expect } from 'chai';
import {
  filterWarpRoutesIds,
  parseWarpRouteConfigId,
  warpRouteConfigPathToId,
} from '../../src/registry/warp-utils.js';

const WARP_ROUTE_ID = 'USDT/arbitrum-ethereum';

describe('Warp utils', () => {
  it('Computes a warp ID from a config path', () => {
    expect(warpRouteConfigPathToId('warp_routes/USDT/arbitrum-ethereum-config.yaml')).to.eql(
      WARP_ROUTE_ID,
    );
  });

  it('Parses a warp ID', () => {
    expect(parseWarpRouteConfigId(WARP_ROUTE_ID)).to.eql({
      tokenSymbol: 'USDT',
      chainNames: ['arbitrum', 'ethereum'],
    });
  });

  it('Filters warp route ID maps', () => {
    const idMap = { [WARP_ROUTE_ID]: 'path' };
    expect(filterWarpRoutesIds(idMap).ids.length).to.eql(1);
    expect(filterWarpRoutesIds(idMap, { symbol: 'fakesymbol' }).ids.length).to.eql(0);
  });
});
