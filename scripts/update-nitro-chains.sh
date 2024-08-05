#!/bin/bash

# Change directory to repo root
cd "$(dirname "$0")/.."

nitro_chains=()

for chain_dir in chains/*/; do
    chain_name=$(basename "$chain_dir")
    metadata_file="$chain_dir/metadata.yaml"

    # Check if the chain is an Ethereum protocol type
    if yq e '.protocol == "ethereum"' "$metadata_file" | grep -q true; then
        # Extract RPC URLs from metadata.yaml
        rpc_urls=$(yq e '.rpcUrls[].http' "$metadata_file")

        if [ -n "$rpc_urls" ]; then
            nitro_marker=""
            for rpc_url in $rpc_urls; do
                # Call cast code 0x000000000000000000000000000000000000006c should return 0xfe for nitro chains
                nitro_marker=$(cast code 0x000000000000000000000000000000000000006c --rpc-url "$rpc_url" 2>/dev/null)

                if [ $? -eq 0 ]; then
                    if [ "$nitro_marker" = "0xfe" ]; then
                        nitro_chains+=("$chain_name")
                        yq e '.technicalStack = "arbitrumnitro"' -i "$metadata_file"
                    fi
                    break
                fi
            done

            if [ -z "$nitro_marker" ]; then
                echo "$chain_name: Error fetching block number from all RPC URLs"
            fi
        else
            echo "$chain_name: No RPC URLs found"
        fi
    fi
done

echo "Nitro chains:"
printf '%s\n' "${nitro_chains[@]}"
