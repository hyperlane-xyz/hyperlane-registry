import type { WarpCoreConfig } from '@hyperlane-xyz/sdk';
import { expect } from 'chai';
import {
  filterWarpRoutesIds,
  parseWarpRouteConfigId,
  warpRouteConfigPathToId,
} from '../../src/registry/warp-utils.js';
import { BaseRegistry } from '../../src/registry/BaseRegistry.js';
import { normalizeScale } from '../../src/utils.js';
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

describe('normalizeScale', () => {
  it('returns null for undefined', () => {
    expect(normalizeScale(undefined)).to.equal(null);
  });

  it('returns null for null', () => {
    expect(normalizeScale(null)).to.equal(null);
  });

  it('normalizes a plain number to {N, 1}', () => {
    expect(normalizeScale(1000)).to.deep.equal({ numerator: 1000n, denominator: 1n });
  });

  it('normalizes a {number, number} object', () => {
    expect(normalizeScale({ numerator: 1, denominator: 1000 })).to.deep.equal({
      numerator: 1n,
      denominator: 1000n,
    });
  });

  it('treats semantically equivalent number and object forms as equal', () => {
    expect(normalizeScale(1000)).to.deep.equal(normalizeScale({ numerator: 1000, denominator: 1 }));
  });

  it('treats inverse scales as unequal', () => {
    expect(normalizeScale(1000)).to.not.deep.equal(
      normalizeScale({ numerator: 1, denominator: 1000 }),
    );
  });

  it('returns null for missing scale so absence is distinct from identity', () => {
    expect(normalizeScale(undefined)).to.not.deep.equal(
      normalizeScale({ numerator: 1, denominator: 1 }),
    );
  });
});
