# Hyperlane Warp Routes

This directory contains a list of Warp Route configs. They can be used to interact with warp routes in the [Warp UI](https://github.com/hyperlane-xyz/hyperlane-warp-ui-template) or [CLI](https://www.npmjs.com/package/@hyperlane-xyz/cli).

## Structure

Warp Routes are organized here by asset symbol.
Configs are named based on the names of the chains involved, organized alphabetically.
For example, a route between `ethereum` and `inevm` would be called `ethereum-inevm.yaml`

## Schema

These configs use the WarpCore schema as defined in the [Hyperlane SDK here](https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/typescript/sdk/src/warp/types.ts).

## Contributing

New routes can be added manually or via the CLI's `hyperlane deploy warp` command.
