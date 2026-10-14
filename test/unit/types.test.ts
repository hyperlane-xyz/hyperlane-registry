import fs from 'node:fs';

import { expect } from 'chai';
import { z } from 'zod/v4';

import {
  UpdateChainSchema,
  WarpRouteAllowlistSchema,
  WarpRouteFilterSchema,
  chainMetadata,
  warpRouteConfigs,
} from '../../dist/index.js';

const chainJsonSchema = z.fromJSONSchema(JSON.parse(fs.readFileSync('chains/schema.json', 'utf8')));
const warpJsonSchema = z.fromJSONSchema(
  JSON.parse(fs.readFileSync('deployments/warp_routes/schema.json', 'utf8')),
);

describe('Registry schemas', () => {
  it('validates SDK-owned chain metadata', () => {
    const result = UpdateChainSchema.safeParse({
      metadata: chainMetadata.ethereum,
    });

    expect(result.success).to.equal(true);
  });

  it('preserves SDK metadata validation failures', () => {
    const result = UpdateChainSchema.safeParse({
      metadata: { name: 'invalid' },
    });

    expect(result.success).to.equal(false);
    if (!result.success) {
      expect(result.error.issues.length).to.be.greaterThan(0);
    }
  });

  it('rejects unknown warp route filters', () => {
    expect(WarpRouteFilterSchema.safeParse({ unknown: true }).success).to.equal(false);
  });

  it('validates route notices', () => {
    const result = WarpRouteAllowlistSchema.safeParse({
      warpRouteIds: [
        'TEST/plain',
        {
          id: 'TEST/example',
          notices: [
            { blocksTransfer: true, message: 'Route unavailable', severity: 'error' },
            { blocksTransfer: false, message: 'Custom unaudited code', severity: 'warning' },
            { blocksTransfer: false, message: 'Additional context', severity: 'info' },
          ],
        },
      ],
    });

    expect(result.success).to.equal(true);
  });

  it('rejects invalid route notices', () => {
    expect(
      WarpRouteAllowlistSchema.safeParse({
        warpRouteIds: [
          {
            id: 'invalid',
            notices: [{ blocksTransfer: false, message: '', severity: 'warning' }],
          },
        ],
      }).success,
    ).to.equal(false);
  });

  it('generates a chain JSON schema that accepts valid metadata', () => {
    expect(chainJsonSchema.safeParse(chainMetadata.ethereum).success).to.equal(true);
  });

  it('generates a warp JSON schema that accepts fee constants', () => {
    expect(warpJsonSchema.safeParse(warpRouteConfigs['TIA/mantapacific']).success).to.equal(true);
  });
});
