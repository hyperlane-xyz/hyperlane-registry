import {
  ChainMetadata,
  CosmJsProvider,
  CosmJsWasmProvider,
  EthersV5Provider,
  ProviderType,
  RpcUrl,
  SolanaWeb3Provider,
  protocolToDefaultProviderBuilder,
} from '@hyperlane-xyz/sdk';
import { sleep } from '@hyperlane-xyz/utils';
import { expect } from 'chai';
import { chainAddresses, chainMetadata } from '../../dist/index.js';

import { Mailbox__factory } from '@hyperlane-xyz/core';

const CHAINS_TO_SKIP = [
  'worldchain', // only allows private RPC access
];

const HEALTH_CHECK_TIMEOUT = 10_000; // 10s
const HEALTH_CHECK_DELAY = 3_000; // 3s

async function isRpcHealthy(rpc: RpcUrl, metadata: ChainMetadata): Promise<boolean> {
  const builder = protocolToDefaultProviderBuilder[metadata.protocol];
  const provider = builder([rpc], metadata.chainId);
  if (provider.type === ProviderType.EthersV5)
    return isEthersV5ProviderHealthy(provider.provider, metadata);
  else if (provider.type === ProviderType.SolanaWeb3)
    return isSolanaWeb3ProviderHealthy(provider.provider, metadata);
  else if (provider.type === ProviderType.CosmJsWasm || provider.type === ProviderType.CosmJs)
    return isCosmJsProviderHealthy(provider.provider, metadata);
  else throw new Error(`Unsupported provider type ${provider.type}, new health check required`);
}

async function isEthersV5ProviderHealthy(
  provider: EthersV5Provider['provider'],
  metadata: ChainMetadata,
): Promise<boolean> {
  const chainName = metadata.name;
  const blockNumber = await provider.getBlockNumber();
  if (!blockNumber || blockNumber < 0) return false;
  console.debug(`Block number is okay for ${chainName}`);

  if (chainAddresses[chainName]) {
    const mailboxAddr = chainAddresses[chainName].mailbox;
    const mailbox = Mailbox__factory.createInterface();
    const topics = mailbox.encodeFilterTopics(mailbox.events['DispatchId(bytes32)'], []);
    console.debug(`Checking mailbox logs for ${chainName}`);
    const mailboxLogs = await provider.getLogs({
      address: mailboxAddr,
      topics,
      fromBlock: blockNumber - 99,
      toBlock: blockNumber,
    });
    if (!mailboxLogs) return false;
    console.debug(`Mailbox logs okay for ${chainName}`);
  }
  return true;
}

async function isSolanaWeb3ProviderHealthy(
  provider: SolanaWeb3Provider['provider'],
  metadata: ChainMetadata,
): Promise<boolean> {
  const blockNumber = await provider.getBlockHeight();
  if (!blockNumber || blockNumber < 0) return false;
  console.debug(`Block number is okay for ${metadata.name}`);
  return true;
}

async function isCosmJsProviderHealthy(
  provider: CosmJsProvider['provider'] | CosmJsWasmProvider['provider'],
  metadata: ChainMetadata,
): Promise<boolean> {
  const readyProvider = await provider;
  const blockNumber = await readyProvider.getHeight();
  if (!blockNumber || blockNumber < 0) return false;
  console.debug(`Block number is okay for ${metadata.name}`);
  return true;
}

describe('Chain RPC health', async () => {
  for (const [chain, metadata] of Object.entries(chainMetadata)) {
    if (CHAINS_TO_SKIP.includes(chain)) continue;
    metadata.rpcUrls.map((rpc, i) => {
      it(`${chain} RPC number ${i} is healthy`, async () => {
        const isHealthy = await isRpcHealthy(rpc, metadata);
        if (!isHealthy) await sleep(HEALTH_CHECK_DELAY);
        expect(isHealthy).to.be.true;
      })
        .timeout(HEALTH_CHECK_TIMEOUT + HEALTH_CHECK_DELAY * 2)
        .retries(3);
    });
  }
});
