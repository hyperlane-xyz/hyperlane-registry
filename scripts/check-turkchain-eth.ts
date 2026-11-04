// Read-only RPC/SDK audit. No signer or transaction submission is configured.
import fs from 'node:fs';
import { createRequire } from 'node:module';

import { EvmWarpRouteReader, MultiProvider, HypTokenConfigSchema } from '@hyperlane-xyz/sdk';
import { parse } from 'yaml';
const requireSdk = createRequire(import.meta.resolve('@hyperlane-xyz/sdk'));
const { ethers } = requireSdk('ethers');
const data = JSON.parse(fs.readFileSync('test/fixtures/turkchain-eth-deployment.json', 'utf8'));
const methods = new Set([
  'eth_chainId',
  'net_version',
  'eth_blockNumber',
  'eth_getCode',
  'eth_getStorageAt',
  'eth_getBlockByNumber',
  'eth_getBalance',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getTransactionByHash',
  'eth_call',
  'eth_getLogs',
  'eth_gasPrice',
]);
class ReadOnlyProvider extends ethers.providers.StaticJsonRpcProvider {
  async send(method: string, params: unknown[]) {
    if (!methods.has(method))
      throw new Error(`RPC mutation or unsupported method blocked: ${method}`);
    return super.send(method, params);
  }
}
const providers = {
  ethereum: new ReadOnlyProvider(
    { url: 'https://ethereum-rpc.publicnode.com', timeout: 20000 },
    { chainId: 1, name: 'ethereum' },
  ),
  turkchain: new ReadOnlyProvider(
    { url: 'https://rpc.turkscan.com', timeout: 20000 },
    { chainId: 1919, name: 'turkchain' },
  ),
};
const report: any = {
  time: new Date().toISOString(),
  readOnly: true,
  core: {},
  legacyTurk: {},
  routers: {},
  sdk: {},
};
const read = async (p: any, a: string, sig: string, args: unknown[] = []) => {
  try {
    const c = new ethers.Contract(a, ['function ' + sig], p),
      v = await c[sig.split('(')[0]](...args);
    return { ok: true, value: ethers.BigNumber.isBigNumber(v) ? v.toString() : v };
  } catch (e: any) {
    return { ok: false, error: e.reason ?? e.message };
  }
};
const ethMetadata = parse(fs.readFileSync('chains/ethereum/metadata.yaml', 'utf8')),
  tkMetadata = parse(fs.readFileSync('chains/turkchain/metadata.yaml', 'utf8'));
const mp = new MultiProvider({ ethereum: ethMetadata, turkchain: tkMetadata });
mp.setProvider('ethereum', providers.ethereum);
mp.setProvider('turkchain', providers.turkchain);
report.blocks = {
  ethereum: await providers.ethereum.getBlockNumber(),
  turkchain: await providers.turkchain.getBlockNumber(),
};
const original = parse(fs.readFileSync('chains/turkchain/addresses.yaml', 'utf8'));
for (const [group, entries] of Object.entries({
  registered: original,
  candidate: data.turkchainCoreCandidate,
})) {
  report.core[group] = {};
  const rs = await Promise.allSettled(
    Object.entries(entries as any).map(async ([name, address]) => {
      const code = await providers.turkchain.getCode(address);
      const r: any = {
        address,
        codeBytes: (code.length - 2) / 2,
        codeHash: ethers.utils.keccak256(code),
      };
      if (
        ['mailbox', 'merkleTreeHook', 'validatorAnnounce', 'interchainAccountRouter'].includes(name)
      )
        r.link = await read(
          providers.turkchain,
          address as string,
          name === 'mailbox'
            ? 'localDomain() view returns(uint32)'
            : 'mailbox() view returns(address)',
        );
      return [name, r];
    }),
  );
  for (const r of rs) {
    if (r.status === 'rejected') throw r.reason;
    report.core[group][r.value[0]] = r.value[1];
  }
}
report.core.defaultIsm = await read(
  providers.turkchain,
  data.turkchainCoreCandidate.mailbox,
  'defaultIsm() view returns(address)',
);
const registryRoute = parse(
  fs.readFileSync('deployments/warp_routes/TURK/ethereum-turkchain-config.yaml', 'utf8'),
);
for (const t of registryRoute.tokens) {
  const p = providers[t.chainName as keyof typeof providers],
    code = await p.getCode(t.addressOrDenom);
  const r: any = { address: t.addressOrDenom, codeBytes: (code.length - 2) / 2, calls: {} };
  if (code !== '0x')
    for (const sig of [
      'owner() view returns(address)',
      'mailbox() view returns(address)',
      'routers(uint32) view returns(bytes32)',
      'name() view returns(string)',
      'symbol() view returns(string)',
      'decimals() view returns(uint8)',
    ])
      r.calls[sig.split('(')[0]] = await read(
        p,
        t.addressOrDenom,
        sig,
        sig.startsWith('routers') ? [t.chainName === 'ethereum' ? 1919 : 1] : [],
      );
  report.legacyTurk[t.chainName] = r;
}
for (const [chain, address] of [
  ['ethereum', data.ethereumRouter],
  ['turkchain', data.turkchainTokenRouter],
]) {
  const p = providers[chain as keyof typeof providers],
    r: any = { address, codeBytes: ((await p.getCode(address)).length - 2) / 2, calls: {} };
  for (const sig of [
    'owner() view returns(address)',
    'mailbox() view returns(address)',
    'hook() view returns(address)',
    'interchainSecurityModule() view returns(address)',
    'domains() view returns(uint32[])',
    'routers(uint32) view returns(bytes32)',
    'PACKAGE_VERSION() view returns(string)',
    'token() view returns(address)',
    'totalSupply() view returns(uint256)',
    'MINIMUM() view returns(uint256)',
    'minimum() view returns(uint256)',
  ])
    r.calls[sig.split('(')[0]] = await read(
      p,
      address,
      sig,
      sig.startsWith('routers') ? [chain === 'ethereum' ? 1919 : 1] : [],
    );
  for (const [label, sig] of [
    ['name', 'name() view returns(string)'],
    ['symbol', 'symbol() view returns(string)'],
    ['decimals', 'decimals() view returns(uint8)'],
  ])
    if (chain === 'turkchain') r.calls[label] = await read(p, address, sig);
  report.routers[chain] = r;
}
report.routerReceipt = await providers.ethereum.getTransactionReceipt(data.routerTransaction);
for (const [chain, address] of [
  ['ethereum', data.ethereumRouter],
  ['turkchain', data.turkchainTokenRouter],
]) {
  try {
    const reader = new EvmWarpRouteReader(mp, chain, 3),
      config = await reader.deriveWarpRouteConfig(address);
    HypTokenConfigSchema.parse(config);
    report.sdk[chain] = { ok: true, config };
  } catch (e: any) {
    report.sdk[chain] = { ok: false, error: e.message };
  }
}
report.ethereumIsm = {
  moduleType: await read(providers.ethereum, data.ethereumIsm, 'moduleType() view returns(uint8)'),
  validators: await read(
    providers.ethereum,
    data.ethereumIsm,
    'validatorsAndThreshold(bytes) view returns(address[],uint8)',
    ['0x'],
  ),
};
fs.mkdirSync('.audit', { recursive: true });
fs.writeFileSync('.audit/turkchain-eth-live.json', JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      blocks: report.blocks,
      core: report.core,
      legacy: report.legacyTurk,
      routers: report.routers,
      sdk: report.sdk,
    },
    null,
    2,
  ),
);
