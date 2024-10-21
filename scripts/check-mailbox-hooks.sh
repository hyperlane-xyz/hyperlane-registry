#!/bin/bash

# Change directory to repo root
cd "$(dirname "$0")/.."

for chain_dir in chains/*/; do
    chain_name=$(basename "$chain_dir")

    if [ "$#" -gt 0 ]; then
        chain_in_list=false
        for arg in "$@"; do
            if [ "$chain_name" == "$arg" ]; then
                chain_in_list=true
                break
            fi
        done
        if [ "$chain_in_list" == false ]; then
            continue
        fi
    fi

    metadata_file="$chain_dir/metadata.yaml"
    addresses_file="$chain_dir/addresses.yaml"

    # Check if the chain is an Ethereum protocol type
    if ! yq e '.deployer.name == "Abacus Works"' "$metadata_file" | grep -q true; then
        echo "$chain_name: Not Abacus Works, skipping."
        continue
    fi

    # Check if there are addresses for the chain
    if [ ! -f "$addresses_file" ]; then
        echo "$chain_name: No addresses found, skipping."
        continue
    fi

    # Check if addresses.yaml has a merkleTreeHook entry
    merkle_tree_hook=$(yq e '.merkleTreeHook' "$addresses_file")
    if [ "$merkle_tree_hook" = "null" ]; then
        echo "$chain_name: No address for merkleTreeHook, skipping."
        continue
    fi

    # Check if addresses.yaml has a fallbackRoutingHook entry
    fallback_routing_hook=$(yq e '.fallbackRoutingHook' "$addresses_file")
    if [ "$merkle_tree_hook" = "null" ]; then
        echo "$chain_name: No address for fallbackRoutingHook, skipping."
        continue
    fi

    # Check if the chain is an Ethereum protocol type
    if ! yq e '.protocol == "ethereum"' "$metadata_file" | grep -q true; then
        echo "$chain_name: Not EVM, skipping."
        continue
    fi

    # Extract RPC URL from metadata.yaml
    rpc_url=$(yq e '.rpcUrls[0].http' "$metadata_file")
    if [ -z "$rpc_url" ]; then
        echo "$chain_name: No RPC URL found"
        continue
    fi

    # Get mailbox address from addresses.yaml
    mailbox=$(yq e '.mailbox' "$addresses_file")
    if [ -z "$mailbox" ]; then
        # echo "$chain_name: No mailbox address found"
        continue
    fi

    # Get defaultHook
    default_hook=$(cast call "$mailbox" 'defaultHook()' --rpc-url "$rpc_url" 2>/dev/null)
    if [ -z "$default_hook" ]; then
        echo "$chain_name: Error calling defaultHook"
        continue
    fi

    # Normalize addresses by removing '0x' prefix, ensuring 40 characters, and converting to lowercase
    normalized_default_hook=$(echo "$default_hook" | sed 's/^0x//' | awk '{print substr("0000000000000000000000000000000000000000" $0, length($0) + 1, 40)}' | tr '[:upper:]' '[:lower:]')
    normalized_fallback_routing_hook=$(echo "$fallback_routing_hook" | sed 's/^0x//' | awk '{print substr("0000000000000000000000000000000000000000" $0, length($0) + 1, 40)}' | tr '[:upper:]' '[:lower:]')

    # Compare normalized addresses
    if [ "$normalized_default_hook" != "$normalized_fallback_routing_hook" ]; then
        echo "$chain_name: Mismatch - defaultHook: $normalized_default_hook, fallbackRoutingHook: $normalized_fallback_routing_hook"
    fi

    # Truncate the default_hook to the last 40 characters (20 bytes)
    truncated_hook=$(echo "$default_hook" | sed 's/^0x//' | awk '{print substr($0, length($0)-39)}')

    # Call fallbackHook on the truncated result
    fallback_hook=$(cast call "0x$truncated_hook" 'fallbackHook()' --rpc-url "$rpc_url" 2>/dev/null)
    if [ -z "$fallback_hook" ]; then
        echo "$chain_name: Error calling fallbackHook"
        continue
    fi

    # Get merkleTreeHook from addresses.yaml
    merkle_tree_hook=$(yq e '.merkleTreeHook' "$addresses_file")

    # Normalize addresses by removing '0x' prefix, ensuring 40 characters, and converting to lowercase
    normalized_fallback_hook=$(echo "$fallback_hook" | sed 's/^0x//' | awk '{print substr("0000000000000000000000000000000000000000" $0, length($0) + 1, 40)}' | tr '[:upper:]' '[:lower:]')
    normalized_merkle_tree_hook=$(echo "$merkle_tree_hook" | sed 's/^0x//' | awk '{print substr("0000000000000000000000000000000000000000" $0, length($0) + 1, 40)}' | tr '[:upper:]' '[:lower:]')

    # Compare normalized addresses
    if [ "$normalized_fallback_hook" != "$normalized_merkle_tree_hook" ]; then
        echo "$chain_name: Mismatch - fallbackHook: $normalized_fallback_hook, merkleTreeHook: $normalized_merkle_tree_hook"
        # Update the merkleTreeHook in addresses.yaml with the new fallback_hook value
        # yq e -i ".merkleTreeHook = \"$fallback_hook\"" "$addresses_file"
        # echo "$chain_name: Updated merkleTreeHook in addresses.yaml"
    fi
done
