import { ChainMetadataSchema } from '@hyperlane-xyz/sdk/metadata/chainMetadataTypes';
import type { WarpRouteDeployConfig } from '@hyperlane-xyz/sdk/token/types';
import type { ChainName } from '@hyperlane-xyz/sdk/types';
import type { WarpCoreConfig } from '@hyperlane-xyz/sdk/warp/types';
import { z } from 'zod/v4';

import { WARP_ROUTE_ID_REGEX } from './consts.js';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements
export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

export const ChainAddressesSchema = z.record(z.string(), z.string());
export type ChainAddresses = z.infer<typeof ChainAddressesSchema>;

/**
 * Schema for warp route filter parameters.
 * This serves as the single source of truth for both TypeScript types and validation.
 */
export const WarpRouteFilterSchema = z.strictObject({
  symbol: z.string().optional(),
  label: z.string().optional(),
});

/**
 * TypeScript type inferred from the schema.
 */
export type WarpRouteFilterParams = z.infer<typeof WarpRouteFilterSchema>;

export const UpdateChainSchema = z.object({
  metadata: ChainMetadataSchema.optional(),
  addresses: ChainAddressesSchema.optional(),
});

export type UpdateChainParams = z.infer<typeof UpdateChainSchema> & {
  chainName: ChainName;
};

export const WarpRouteIdSchema = z
  .string()
  .regex(
    WARP_ROUTE_ID_REGEX,
    'Must be in the format SYMBOL/label (e.g., ETH/ethereum-base, USDC.e/arbitrum-polygon)',
  );
export type WarpRouteId = z.infer<typeof WarpRouteIdSchema>;
export type WarpRouteConfigMap = Record<WarpRouteId, WarpCoreConfig>;
export type WarpDeployConfigMap = Record<WarpRouteId, WarpRouteDeployConfig>;

export const WarpRouteNoticeSeveritySchema = z.enum(['error', 'warning', 'info']);
export type WarpRouteNoticeSeverity = z.infer<typeof WarpRouteNoticeSeveritySchema>;

export const WarpRouteNoticeSchema = z.strictObject({
  blocksTransfer: z.boolean(),
  message: z.string().trim().min(1),
  severity: WarpRouteNoticeSeveritySchema,
});
export type WarpRouteNotice = z.infer<typeof WarpRouteNoticeSchema>;

export const WarpRouteAllowlistEntrySchema = z.union([
  WarpRouteIdSchema,
  z.strictObject({
    id: WarpRouteIdSchema,
    notices: z.array(WarpRouteNoticeSchema).min(1),
  }),
]);
export type WarpRouteAllowlistEntry = z.infer<typeof WarpRouteAllowlistEntrySchema>;

export const WarpRouteAllowlistSchema = z.strictObject({
  warpRouteIds: z.array(WarpRouteAllowlistEntrySchema),
});
export type WarpRouteAllowlist = z.infer<typeof WarpRouteAllowlistSchema>;

export const AddWarpRouteConfigOptionsSchema = z.union([
  z.object({ symbol: z.string() }),
  z.object({ warpRouteId: WarpRouteIdSchema }),
]);
export type AddWarpRouteConfigOptions = z.infer<typeof AddWarpRouteConfigOptionsSchema>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
