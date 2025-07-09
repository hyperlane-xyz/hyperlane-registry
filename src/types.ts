import {
  ChainMetadataSchema,
  ChainName,
  type WarpCoreConfig,
  type WarpRouteDeployConfig,
} from '@hyperlane-xyz/sdk';
import { z } from 'zod';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements
export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

export const ChainAddressesSchema = z.record(z.string());
export type ChainAddresses = z.infer<typeof ChainAddressesSchema>;

/**
 * Schema for warp route filter parameters.
 * This serves as the single source of truth for both TypeScript types and validation.
 */
export const WarpRouteFilterSchema = z
  .object({
    symbol: z.string().optional(),
    label: z.string().optional(),
  })
  .strict();

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

export type WarpRouteId = string;
export type WarpRouteConfigMap = Record<WarpRouteId, WarpCoreConfig>;
export type WarpDeployConfigMap = Record<WarpRouteId, WarpRouteDeployConfig>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
