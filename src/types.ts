import type { WarpCoreConfig, WarpRouteDeployConfigWithoutMailbox } from '@hyperlane-xyz/sdk';
import { z } from 'zod';

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements
export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

export const ChainAddressesSchema = z.record(z.string());
export type ChainAddresses = z.infer<typeof ChainAddressesSchema>;

export type WarpRouteId = string;
export type WarpRouteConfigMap = Record<WarpRouteId, WarpCoreConfig>;
export type WarpDeployConfigMap = Record<WarpRouteId, WarpRouteDeployConfigWithoutMailbox>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
