# heyAura ADX: BNB Chain / Ethereum

`ADX/bsc-ethereum` registers the existing collateral-to-collateral bridge for
[heyAura](https://www.heyaura.com/). Both legs escrow the existing ADX token;
neither leg is a newly issued synthetic token. The token contracts still report
the name `AdEx Network` and the symbol `ADX`.

Bridge UI: <https://heyaura-bridge.whyduck.chatgpt.site>

## On-chain verification

The following state was read using Hyperlane SDK 45.0.1 and public JSON-RPC
`eth_call` / `eth_getStorageAt` queries, pinned to the blocks below on
2026-11-20. This is an address/configuration check, not a contract audit.

| Field               | BNB Chain                                    | Ethereum                                     |
| ------------------- | -------------------------------------------- | -------------------------------------------- |
| Chain / domain ID   | 56                                           | 1                                            |
| Snapshot block      | 134693720                                    | 26456249                                     |
| Snapshot time (UTC) | 12:17:01                                     | 12:16:59                                     |
| Router              | `0x3db228c4A52093b82CE51059741436f88A594bE9` | `0x3db228c4A52093b82CE51059741436f88A594bE9` |
| Collateral token    | `0x6bfF4Fb161347ad7de4A625AE5aa3A1CA7077819` | `0xADE00C28244d5CE17D72E40330B1c318cD12B7c3` |
| ADX held by router  | 394857.729486299345004024                    | 399981.320924310036162994                    |
| Mailbox             | `0x2971b9Aec44bE4eb673DF1B88cDB57b96eefe8a4` | `0xc005dc82818d67AF737725bD4bf75435d065D239` |
| ProxyAdmin          | `0x3BbCF7dc4eD18b4169210335f661fc12A7A283B7` | `0xe9931415fBf51624d57106e22Cc9c93C7Ba63C6f` |
| Implementation      | `0x46c52bd64bE7cb05C76642B8c9E941e6183A7B2f` | `0x46c52bd64bE7cb05C76642B8c9E941e6183A7B2f` |

Both routers are `HypERC20Collateral` version `12.2.0`, with 18-decimal
collateral and a 1:1 scale. Each router enrolls the other chain's router as its
only remote peer. Destination gas is `68000` in each direction. Neither router
has an allowed rebalancer or an allowed rebalancing bridge at this snapshot.

The current owner of both routers, both ProxyAdmins, both route-specific
PausableISMs, and all four rate limiters is
`0x7fe97ec8C3831b8148AF87bc9e271D2eE9759816`. The earlier deployment owner
`0x998f31d7403dB347aed69186421e52ecE492b36F` is not the current owner.

Liquidity figures are a dated snapshot, not a guarantee of available liquidity.

## Deployed security controls

| Contract                              | BNB Chain                                    | Ethereum                                     |
| ------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| Router ISM (outer 2-of-2 aggregation) | `0x6B9f245dCA7065c0cAAa71Ec5AC32B307e168933` | `0xfAeba00A09E0353c7058802f44e2849cE943858F` |
| Inner 2-of-2 aggregation              | `0x121DDE2A29A8A6beBF5BAA6d0CfaD1E531E3A6e2` | `0x7c30bcabA8218896FbFdcA8F3c129Cf50305BD42` |
| DefaultIsm wrapper                    | `0x97798B8E64bA23b21f1Eca0f38dF001715D85BC7` | `0xb9e324c03Ea281007307cA8491cc34881C53F39F` |
| Route PausableIsm                     | `0xe0045AaCf79BfBAe44066CE051311359b0955a81` | `0x97798B8E64bA23b21f1Eca0f38dF001715D85BC7` |
| RateLimitedIsm                        | `0x610736b7F3CBe1417344C79e3d75F8d38908ec81` | `0xF096Ed5a6aE335990Cb22eC857246a8A1515CE3A` |
| Router aggregation hook               | `0x0c329fb706B45089791ce0434ee95ea9DD6E168e` | `0x3B07233F61F06f97adB99402608Bda663689F685` |
| DefaultHook wrapper                   | `0x5495c13BDb5d269e7aE03Ce128516cF2E9009484` | `0xc9d399A97E9E7566a0E461f28639b7854618823d` |
| RateLimitedHook                       | `0xecc99a4A446F9bCC1A83cE6443f10113A70a22d1` | `0x2a4aADfCAd27D1cFADD0BF84Fcc74aCC56142bb2` |

Inbound verification requires both the existing inner security root and the
RateLimitedIsm. The inner root requires both the Mailbox default ISM and the
route owner's PausableIsm. Both route pause modules were unpaused at the
snapshot. Outbound dispatch uses both the default hook wrapper and the
RateLimitedHook.

Each limiter's recipient/sender is bound to the router on its own chain, and
its Mailbox matches the router's Mailbox. All four limiters have:

- `maxCapacity`: `499999999999999999996800` ADX base units (approximately 500,000 ADX).
- `DURATION`: `86400` seconds.
- `refillRate`: `5787037037037037037` ADX base units per second.

These are continuously refilling token buckets, not strict rolling or calendar
500,000-ADX-per-day limits. There is no per-transfer cap or manual-approval
branch in this route configuration.

The deploy YAML references the installed ISM and hook roots by address. This
preserves the existing composition and uses the live owners rather than an old
deployment plan. Mailboxes are supplied by the existing chain registry entries,
which match the on-chain reads above.

## Provenance and transfer evidence

- On-chain router reads: [BNB Chain](https://bscscan.com/address/0x3db228c4A52093b82CE51059741436f88A594bE9#readProxyContract), [Ethereum](https://etherscan.io/address/0x3db228c4A52093b82CE51059741436f88A594bE9#readProxyContract).
- Snapshot RPCs: <https://bsc-rpc.publicnode.com> and <https://ethereum-rpc.publicnode.com>.
- Previously completed [Ethereum to BNB Chain transfer](https://explorer.hyperlane.xyz/message/0xd102af9b34af405c3344d8b08f1dda6f349c5784665428f1a634ee1de63c41a9).
- Previously completed [BNB Chain to Ethereum transfer](https://explorer.hyperlane.xyz/message/0x4e86bf821d5f9f4c3fd4bc7c9e2b8491ab56cc3830d50d9b3b72afa0e320cec1).
- CoinGecko ID `adex` and collateral addresses were checked against the [CoinGecko contract API](https://api.coingecko.com/api/v3/coins/ethereum/contract/0xade00c28244d5ce17d72e40330b1c318cd12b7c3).
- `logo.svg` is the official vector [heyAura green symbol](https://github.com/heyAuraDev/heyAura-brand/blob/main/heyAura/heyAura%20Logos/SVG/symbol_green_on_dark.svg). The raster-embedded token SVG is excluded to meet the registry's SVG requirements.
