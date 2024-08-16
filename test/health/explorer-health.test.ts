import { ChainMetadata } from '@hyperlane-xyz/sdk';
import { Address, ProtocolType, sleep } from '@hyperlane-xyz/utils';
import { expect } from 'chai';
import { chainMetadata } from '../../dist/index.js';
// TODO export these from the SDK
import {
  getExplorerAddressUrl,
  getExplorerBaseUrl,
  getExplorerTxUrl,
} from '../../node_modules/@hyperlane-xyz/sdk/dist/metadata/blockExplorer.js';

const CHAINS_TO_SKIP = [
  'base', // explorer works but has extremely strict rate limits
];

const HEALTH_CHECK_TIMEOUT = 15_000; // 15s
const HEALTH_CHECK_DELAY = 5_000; // 5s

const PROTOCOL_TO_ADDRESS: Record<ProtocolType, Address> = {
  [ProtocolType.Ethereum]: '0x0000000000000000000000000000000000000000',
  [ProtocolType.Sealevel]: '11111111111111111111111111111111',
  [ProtocolType.Cosmos]: 'cosmos100000000000000000000000000000000000000',
};

const PROTOCOL_TO_TX_HASH: Partial<Record<ProtocolType, Address>> = {
  [ProtocolType.Ethereum]: '0x0000000000000000000000000000000000000000000000000000000000000000',
  [ProtocolType.Cosmos]: '0000000000000000000000000000000000000000000000000000000000000000',
};

export async function isBlockExplorerHealthy(
  chainMetadata: ChainMetadata,
  address?: Address,
  txHash?: string,
): Promise<boolean> {
  const baseUrl = getExplorerBaseUrl(chainMetadata);
  if (!baseUrl) return false;
  console.debug(`Got base url: ${baseUrl}`);

  console.debug(`Checking explorer home for ${chainMetadata.name}`);
  await fetch(baseUrl);
  console.debug(`Explorer home exists for ${chainMetadata.name}`);

  if (address) {
    console.debug(`Checking explorer address page for ${chainMetadata.name}`);
    const addressUrl = getExplorerAddressUrl(chainMetadata, address);
    if (!addressUrl) return false;
    console.debug(`Got address url: ${addressUrl}`);
    const addressReq = await fetch(addressUrl);
    if (!addressReq.ok && addressReq.status !== 404) return false;
    console.debug(`Explorer address page okay for ${chainMetadata.name}`);
  }

  if (txHash) {
    console.debug(`Checking explorer tx page for ${chainMetadata.name}`);
    const txUrl = getExplorerTxUrl(chainMetadata, txHash);
    if (!txUrl) return false;
    console.debug(`Got tx url: ${txUrl}`);
    const txReq = await fetch(txUrl);
    if (!txReq.ok && txReq.status !== 404) return false;
    console.debug(`Explorer tx page okay for ${chainMetadata.name}`);
  }

  return true;
}

describe('Chain block explorer health', async () => {
  for (const [chain, metadata] of Object.entries(chainMetadata)) {
    if (!metadata.blockExplorers?.length || CHAINS_TO_SKIP.includes(chain)) continue;
    it(`${chain} default explorer is healthy`, async () => {
      const isHealthy = await isBlockExplorerHealthy(
        metadata,
        PROTOCOL_TO_ADDRESS[metadata.protocol],
        PROTOCOL_TO_TX_HASH[metadata.protocol],
      );
      if (!isHealthy) await sleep(HEALTH_CHECK_DELAY);
      expect(isHealthy).to.be.true;
    })
      .timeout(HEALTH_CHECK_TIMEOUT + HEALTH_CHECK_DELAY * 2)
      .retries(3);
  }
});
