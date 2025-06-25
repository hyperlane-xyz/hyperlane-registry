#!/bin/bash

# Change directory to repo root
cd "$(dirname "$0")/.."

# Check if BEFORE_SHA and AFTER_SHA are provided as arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    # If either is missing, default to all chains/*
    CHANGED_DIRS=$(find chains/* -type d)
else
    # Only run for chains in the current diff
    BEFORE_SHA=$1
    AFTER_SHA=$2
    CHANGED_DIRS=$(git diff "$BEFORE_SHA".."$AFTER_SHA" --name-only | grep -E '^chains/' | xargs -I {} dirname {} | sort | uniq)
fi

nitro_chains=()

for chain_dir in $CHANGED_DIRS; do
    chain_name=$(basename "$chain_dir")
    metadata_file="$chain_dir/metadata.yaml"

    # Check if the chain is an Ethereum protocol type
    if yq e '.protocol == "ethereum"' "$metadata_file" | grep -q true; then
        # Extract RPC URLs from metadata.yaml
        rpc_urls=$(yq e '.rpcUrls[].http' "$metadata_file")

        if [ -n "$rpc_urls" ]; then
            # Use the first RPC URL to check if the chain is a nitro chain
            rpc_url=$(echo "$rpc_urls" | head -n 1)
            # Should return 0xfe for nitro chains
            nitro_marker=$(cast code 0x000000000000000000000000000000000000006c --rpc-url "$rpc_url" 2>/dev/null)

            # Check if `cast` was successful and whether its value equals "0xfe"
            if [ $? -eq 0 ] && [ "$nitro_marker" = "0xfe" ]; then
                # Add chain to nitro_chains array
                nitro_chains+=("$chain_name")
                # Ensure metadata.yaml includes "technicalStack" field
                yq e '.technicalStack = "arbitrumnitro"' -i "$metadata_file"
            fi

            # Log error if nitro marker is not found
            if [ -z "$nitro_marker" ]; then
                echo "$chain_name: Error fetching nitro marker"
            fi
        else
            echo "$chain_name: No RPC URLs found"
        fi
    fi
done

echo "Nitro chains:"
printf '%s\n' "${nitro_chains[@]}"
