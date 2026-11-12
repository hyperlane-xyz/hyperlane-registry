// SDK read/populate only. Populated transactions are never signed or submitted.
import fs from 'node:fs';
import { createRequire } from 'node:module';

import { MultiProvider, MultiProtocolProvider, WarpCore } from '@hyperlane-xyz/sdk';
import { parse } from 'yaml';
const requireSdk = createRequire(import.meta.resolve('@hyperlane-xyz/sdk'));
const { ethers } = requireSdk('ethers');
const read = (p: string) => parse(fs.readFileSync(p, 'utf8'));
const metadata = {
  ethereum: read('chains/ethereum/metadata.yaml'),
  turkchain: read('chains/turkchain/metadata.yaml'),
};
const allowed = new Set([
  'eth_chainId',
  'net_version',
  'eth_blockNumber',
  'eth_getCode',
  'eth_getStorageAt',
  'eth_call',
  'eth_getBalance',
  'eth_getTransactionCount',
]);
class ReadOnlyProvider extends ethers.providers.StaticJsonRpcProvider {
  async send(method: string, params: unknown[]) {
    if (!allowed.has(method)) throw new Error(`Forbidden RPC ${method}`);
    return super.send(method, params);
  }
}
const mp = new MultiProvider(metadata);
mp.setProvider(
  'ethereum',
  new ReadOnlyProvider(
    { url: 'https://ethereum-rpc.publicnode.com', timeout: 15000 },
    { chainId: 1, name: 'ethereum' },
  ),
);
mp.setProvider(
  'turkchain',
  new ReadOnlyProvider(
    { url: 'https://rpc.turkscan.com', timeout: 15000 },
    { chainId: 1919, name: 'turkchain' },
  ),
);
const mpp = MultiProtocolProvider.fromMultiProvider(mp),
  core = WarpCore.FromConfig(
    mpp,
    read('deployments/warp_routes/ETH/ethereum-turkchain-config.yaml'),
  );
const owner = '0xb3A776BfC1Ba98ec9255E091aAFe3aEB76d48c6b',
  report: any = { readOnly: true, transactionsSubmitted: 0, chains: {} };
for (const token of core.tokens) {
  const adapter: any = token.getHypAdapter(mpp),
    destination = token.chainName === 'ethereum' ? 1919 : 1;
  const r: any = { adapter: adapter.constructor.name };
  try {
    r.domains = await adapter.getDomains();
    const tx = await adapter.populateTransferRemoteTx({
      weiAmountOrId: '44000000000000',
      destination,
      recipient: owner,
      interchainGas: { igpQuote: { amount: 0n } },
    });
    const iface = new ethers.utils.Interface(['function transferRemote(uint32,bytes32,uint256)']);
    const decoded = iface.decodeFunctionData('transferRemote', tx.data);
    r.populated = {
      to: tx.to,
      value: tx.value?.toString() ?? '0',
      selector: tx.data.slice(0, 10),
      domain: decoded[0],
      recipient: decoded[1],
      amount: decoded[2].toString(),
    };
    if (
      tx.to.toLowerCase() !== token.addressOrDenom.toLowerCase() ||
      decoded[0] !== destination ||
      decoded[2].toString() !== '44000000000000'
    )
      throw new Error('SDK calldata mismatch');
    r.ok = true;
  } catch (e: any) {
    r.ok = false;
    r.error = e.reason ?? e.message;
  }
  report.chains[token.chainName] = r;
}
fs.mkdirSync('.audit', { recursive: true });
fs.writeFileSync('.audit/turkchain-eth-sdk.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (Object.values(report.chains).some((r: any) => !r.ok)) process.exitCode = 1;
