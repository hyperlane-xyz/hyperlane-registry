# Hyperlane Registry

A collection of configs, artifacts, and schemas for Hyperlane.

## Contents

### Chains

A list of chains and the relevant information that Hyperlane utilities and apps will require to interact with chains.
Structured as a folder for each chain. Each folder should contain a `metadata.yaml`, `addresses.yaml`, and a `logo.svg` file.

### Deployments

**WORK IN PROGRESS: Note, the shape and contents of the deployments folders are subject to change**

#### Core

Configs and artifacts for [Hyperlane Core Contract](https://docs.hyperlane.xyz/docs/deploy/deploy-hyperlane) deployments.

#### Warp

Address artifacts for [Warp Route](https://docs.hyperlane.xyz/docs/deploy/deploy-warp-route) token deployments.

## Usage

### Via the NPM package

```sh
# With npm
npm install @hyperlane-xyz/registry
# Or with yarn
yarn add @hyperlane-xyz/registry
```

### Via SDK utilities

_Coming soon!_
