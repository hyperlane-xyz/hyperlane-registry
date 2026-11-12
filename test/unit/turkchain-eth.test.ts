import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';

import {
  ChainMetadataSchema,
  MultiProtocolProvider,
  WarpCore,
  WarpCoreConfigSchema,
  WarpRouteDeployConfigSchema,
} from '@hyperlane-xyz/sdk';
import { expect } from 'chai';
import { parse } from 'yaml';

import { FileSystemRegistry } from '../../src/fs/FileSystemRegistry.js';
const requireSdk = createRequire(import.meta.resolve('@hyperlane-xyz/sdk'));
const { utils } = requireSdk('ethers');
const read = (p: string) => parse(fs.readFileSync(p, 'utf8'));
const expected = JSON.parse(fs.readFileSync('test/fixtures/turkchain-eth-deployment.json', 'utf8'));
const core = read('deployments/warp_routes/ETH/ethereum-turkchain-config.yaml');
const deploy = read('deployments/warp_routes/ETH/ethereum-turkchain-deploy.yaml');

describe('Turkchain ETH observed deployment', () => {
  it('validates both schemas and creates official SDK native/synthetic adapters', () => {
    WarpCoreConfigSchema.parse(core);
    WarpRouteDeployConfigSchema.parse(deploy);
    const mp = new MultiProtocolProvider({
      ethereum: read('chains/ethereum/metadata.yaml'),
      turkchain: read('chains/turkchain/metadata.yaml'),
    });
    const warp = WarpCore.FromConfig(mp, core);
    expect(warp.tokens).to.have.length(2);
    expect(
      warp.tokens.find((t) => t.chainName === 'ethereum')!.getHypAdapter(mp).constructor.name,
    ).to.equal('EvmHypNativeAdapter');
    expect(
      warp.tokens.find((t) => t.chainName === 'turkchain')!.getHypAdapter(mp).constructor.name,
    ).to.equal('EvmHypSyntheticAdapter');
  });
  it('records observed reciprocal enrollment without enabling engine transfers', () => {
    for (const [chain, destination] of [
      ['ethereum', 'turkchain'],
      ['turkchain', 'ethereum'],
    ]) {
      const token = core.tokens.find((t: any) => t.chainName === chain);
      const target = core.tokens.find((t: any) => t.chainName === destination);
      const domain = destination === 'ethereum' ? 1 : 1919;
      expect(token.connections).to.deep.equal([
        { token: 'ethereum|' + destination + '|' + target.addressOrDenom },
      ]);
      expect(deploy[chain].remoteRouters).to.deep.equal({
        [domain]: { address: target.addressOrDenom },
      });
      expect(deploy[chain].destinationGas).to.deep.equal({ [domain]: '0' });
    }
    const allow = read('deployments/warp_routes/warpRouteAllowlist.yaml');
    const entry = allow.warpRouteIds.find((x: any) => x.id === 'ETH/ethereum-turkchain');
    expect(
      entry.notices.some((x: any) => x.blocksTransfer === true && x.severity === 'error'),
    ).to.equal(true);
  });
  it('keeps the synthetic implementation distinct and records isolated accounting evidence', () => {
    expect(expected.turkchainImplementation.toLowerCase()).not.to.equal(
      expected.turkchainTokenRouter.toLowerCase(),
    );
    expect(expected.liveReadback.turkchain.isolationActive).to.equal(true);
    expect(expected.liveReadback.turkchain.totalRedemptionCredit).to.equal('0');
    expect(expected.liveReadback.turkchain.legacySupply).to.equal('500000000000000000000');
    expect(expected.transferEvidence).to.have.length(2);
    for (const ev of expected.transferEvidence)
      for (const value of Object.values(ev)) expect(value).to.match(/^0x[0-9a-f]{64}$/);
  });
  it('records the native Router and the combined synthetic-token Router proxy separately', () => {
    const eth = core.tokens.find((t: any) => t.chainName === 'ethereum'),
      tk = core.tokens.find((t: any) => t.chainName === 'turkchain');
    expect(eth.addressOrDenom).to.equal(expected.ethereumRouter);
    expect(eth.standard).to.equal('EvmHypNative');
    expect(tk.addressOrDenom).to.equal(expected.turkchainTokenRouter);
    expect(tk.standard).to.equal('EvmHypSynthetic');
    expect(eth.name).to.equal('Ether');
    expect(tk.name).to.equal('Ethereum');
    expect(core.tokens.every((t: any) => t.decimals === 18 && t.symbol === 'ETH')).to.equal(true);
  });
  it('keeps custom Router ISM out of global Ethereum Core addresses', () => {
    const eth = read('chains/ethereum/addresses.yaml');
    expect(eth.mailbox).to.equal(expected.ethereumMailbox);
    expect(eth.interchainSecurityModule).to.equal(expected.ethereumCoreDefaultIsm);
    expect(eth.interchainSecurityModule).not.to.equal(expected.ethereumIsm);
    expect(deploy.ethereum.interchainSecurityModule.address).to.equal(expected.ethereumIsm);
    expect(deploy.ethereum.interchainSecurityModule.threshold).to.equal(1);
    expect(deploy.ethereum.interchainSecurityModule.validators).to.deep.equal([expected.validator]);
  });
  it('does not invent a ProxyAdmin for the direct native Router', () => {
    expect(deploy.ethereum).not.to.have.property('proxyAdmin');
    expect(deploy.turkchain.proxyAdmin.address).to.equal(
      '0xDb32dC96F68c5F48aBA4d0decfa489f6EEde1C9b',
    );
    expect(deploy.turkchain.proxyAdmin.owner).to.equal(
      '0x8b00ecb1e8BF59F5Ab4Ba0F0c528c4F4d850280E',
    );
    expect(deploy.ethereum.owner).to.equal(expected.owner);
    expect(deploy.turkchain.owner).to.equal(expected.owner);
  });
  it('keeps chain/domain/currency identity', () => {
    const m = read('chains/turkchain/metadata.yaml');
    ChainMetadataSchema.parse(m);
    expect(m.chainId).to.equal(1919);
    expect(m.domainId).to.equal(1919);
    expect(m.nativeToken.symbol).to.equal('TURK');
    expect(m.nativeToken.decimals).to.equal(18);
  });
  it('preserves the logo, global Ethereum Core, and both legacy TURK files byte-for-byte', () => {
    for (const [file, hash] of Object.entries(expected.protectedFileSha256)) {
      if (file.startsWith('deployments/warp_routes/TURK/') && !fs.existsSync(file)) continue;
      expect(
        crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
        file,
      ).to.equal(hash);
    }
    if (!fs.existsSync('deployments/warp_routes/TURK/ethereum-turkchain-deploy.yaml')) return;
    const legacy = read('deployments/warp_routes/TURK/ethereum-turkchain-deploy.yaml');
    for (const chain of ['ethereum', 'turkchain'])
      expect(legacy[chain].mailbox).to.equal(expected.legacyTurkMailboxes[chain]);
  });
  it('has checksum-correct addresses and no duplicate registration of either new ETH Router', () => {
    for (const t of core.tokens)
      expect(utils.getAddress(t.addressOrDenom)).to.equal(t.addressOrDenom);
    const routes = new FileSystemRegistry({ uri: './' }).getWarpRoutes();
    for (const addr of [expected.ethereumRouter, expected.turkchainTokenRouter]) {
      const matches = Object.entries(routes).filter(([, r]) =>
        r.tokens.some((t) => t.addressOrDenom?.toLowerCase() === addr.toLowerCase()),
      );
      expect(matches.map(([id]) => id)).to.deep.equal(['ETH/ethereum-turkchain']);
    }
  });
});
