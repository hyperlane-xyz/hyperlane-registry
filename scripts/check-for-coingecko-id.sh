#!/bin/bash

# Change directory to repo root
cd "$(dirname "$0")/.."

chains_without_gas_currency=()

for chain_dir in chains/*/; do
    chain_name=$(basename "$chain_dir")
    metadata_file="$chain_dir/metadata.yaml"

    # Check if the deployer is Abacus Works and isTestnet is false or not set
    if yq e '.deployer.name == "Abacus Works" and (.isTestnet == null or .isTestnet == false)' "$metadata_file" | grep -q true; then
        # Check if gasCurrencyCoinGeckoId is not set
        if ! yq e '.gasCurrencyCoinGeckoId' "$metadata_file" | grep -q -v null; then
            chains_without_gas_currency+=("$chain_name")
        fi
    fi
done

if [ ${#chains_without_gas_currency[@]} -eq 0 ]; then
    echo "All Abacus Works chains are configured with gasCurrencyCoinGeckoId."
    exit 0
else
    echo "Chains without gasCurrencyCoinGeckoId:"
    printf '%s\n' "${chains_without_gas_currency[@]}"
    exit 1
fi
