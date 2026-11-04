#!/bin/bash
set -euo pipefail

# Builds a throwaway *overlay registry* that contains ONLY the rpcUrls for the
# chains named in RPC_OVERRIDES_JSON, then exports its path as RPC_OVERLAY_DIR.
# check-warp-deploy passes this as a second `--registry`, so the CLI's
# MergedRegistry overlays the private endpoints on top of the committed metadata
# (later registry wins; the rpcUrls array is replaced while every other field is
# preserved from the base registry). This avoids mutating the checked-out
# registry metadata just to swap RPC endpoints.
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

# Validate the full schema, not just JSON syntax: a top-level object mapping each
# chain to a non-empty array of http(s) URL strings. Fail loudly so a malformed
# secret cannot silently produce a partial or invalid overlay.
if ! echo "$RPC_OVERRIDES_JSON" | jq -e '
  (type == "object") and (length > 0) and
  (to_entries | all(
    (.value | (type == "array") and (length > 0)) and
    (.value | all((type == "string") and test("^https?://")))
  ))' >/dev/null 2>&1; then
  echo "RPC_OVERRIDES_JSON must be a non-empty object mapping each chain to a non-empty array of http(s) URL strings" >&2
  exit 1
fi

OVERLAY_DIR="$(mktemp -d)"

for CHAIN in $(echo "$RPC_OVERRIDES_JSON" | jq -r 'keys[]'); do
  METADATA_FILE="chains/${CHAIN}/metadata.yaml"
  if [ ! -f "$METADATA_FILE" ]; then
    echo "Skipping ${CHAIN}: ${METADATA_FILE} not found in base registry" >&2
    continue
  fi

  # Emit a minimal metadata.yaml with only rpcUrls. FileSystemRegistry reads it
  # without schema validation, and MergedRegistry deep-merges it over the base
  # chain metadata, so the private URLs replace the public rpcUrls array only.
  OVERLAY_JSON=$(echo "$RPC_OVERRIDES_JSON" | jq -c --arg c "$CHAIN" '{rpcUrls: (.[$c] | map({http: .}))}')
  mkdir -p "${OVERLAY_DIR}/chains/${CHAIN}"
  echo "$OVERLAY_JSON" | yq -p=json -o=yaml > "${OVERLAY_DIR}/chains/${CHAIN}/metadata.yaml"

  COUNT=$(echo "$OVERLAY_JSON" | jq '.rpcUrls | length')
  echo "Wrote ${COUNT} override RPC URL(s) for ${CHAIN} to overlay registry"
done

if [ -n "${GITHUB_ENV:-}" ]; then
  echo "RPC_OVERLAY_DIR=${OVERLAY_DIR}" >> "$GITHUB_ENV"
fi
echo "Overlay registry built at ${OVERLAY_DIR}"
