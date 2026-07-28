#!/bin/bash
set -euo pipefail

# Prepends private RPC URLs onto the rpcUrls list of each chain's metadata.yaml
# before check-warp-deploy runs, so the on-chain checks do not fail on flaky,
# rate-limited, or paywalled public endpoints. The private URLs are read from
# the RPC_OVERRIDES_JSON env var (backed by a GitHub Actions secret) so they are
# never committed to the registry.
#
# RPC_OVERRIDES_JSON format (chain name -> list of RPC URLs):
#   {"ethereum": ["https://..."], "bsc": ["https://..."]}
#
# No-op when the variable is empty (e.g. fork PRs, which cannot read secrets).
# URLs are never printed, only per-chain counts, to avoid leaking secrets in CI
# logs.

cd "$(dirname "$0")/../"

if [ -z "${RPC_OVERRIDES_JSON:-}" ]; then
  echo "No RPC overrides provided; using registry default rpcUrls."
  exit 0
fi

if ! echo "$RPC_OVERRIDES_JSON" | jq empty 2>/dev/null; then
  echo "RPC_OVERRIDES_JSON is not valid JSON" >&2
  exit 1
fi

for CHAIN in $(echo "$RPC_OVERRIDES_JSON" | jq -r 'keys[]'); do
  METADATA_FILE="chains/${CHAIN}/metadata.yaml"
  if [ ! -f "$METADATA_FILE" ]; then
    echo "Skipping ${CHAIN}: ${METADATA_FILE} not found" >&2
    continue
  fi

  # Build a JSON list of {http: url} entries and prepend it to rpcUrls so the
  # private endpoints are tried before the public fallbacks.
  URLS_JSON=$(echo "$RPC_OVERRIDES_JSON" | jq -c --arg c "$CHAIN" '.[$c] | map({http: .})')
  export URLS_JSON

  yq -i '.rpcUrls = (env(URLS_JSON) + .rpcUrls)' "$METADATA_FILE"

  COUNT=$(echo "$URLS_JSON" | jq 'length')
  echo "Prepended ${COUNT} override RPC URL(s) to ${CHAIN}"
done
