#!/bin/bash

# Change directory to repo root
cd "$(dirname "$0")/../"

# Check if the correct number of arguments is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <base_commit> <head_commit>"
    exit 1
fi

# Set the BASE_COMMIT and HEAD_COMMIT environment variables
export BASE_COMMIT="$1"
export HEAD_COMMIT="$2"

WARP_ROUTE_IDS=$(
    # ARM = Additions, Renames, Modifications
    git diff --diff-filter=ARM "$BASE_COMMIT".."$HEAD_COMMIT" --name-only |
    grep -E 'warp_routes/.+-(config|deploy)\.yaml$' |
    sed -E 's|deployments/warp_routes/||' |
    sed -E 's|-config\.yaml$||' |
    sed -E 's|-deploy\.yaml$||' |
    sort |
    uniq
)

# Run the Docker image for each warp route ID
echo "Determined warp route IDs:"
for ID in $WARP_ROUTE_IDS; do
    echo "- $ID"
done

# Initialize the job summary
JOB_SUMMARY="## Check Warp Deploy Summary\n"

if [ -z "$WARP_ROUTE_IDS" ]; then
    JOB_SUMMARY+="No warp routes to check!"
else
    JOB_SUMMARY+="| Warp Route ID | Status |\n|-|-|\n"
fi

EXIT_CODE=0

# Run the Docker image for each warp route ID and update the job summary
for WARP_ROUTE_ID in $WARP_ROUTE_IDS; do
    export WARP_ROUTE_ID
    if docker run --rm \
        -e REGISTRY_COMMIT=$HEAD_COMMIT \
        -e CI=true \
        gcr.io/abacus-labs-dev/hyperlane-monorepo:main \
        ./node_modules/.bin/tsx \
        ./typescript/infra/scripts/check/check-deploy.ts \
        -e mainnet3 \
        -m warp \
        --warpRouteId $WARP_ROUTE_ID; then
      STATUS="✅"
    else
      STATUS="❌"
      EXIT_CODE=1
    fi
    JOB_SUMMARY+="| $WARP_ROUTE_ID | $STATUS |\n"
done

# Output the job summary to a file if PR_NUMBER is set
if [ -n "$PR_NUMBER" ]; then
    echo "Writing job summary to check_warp_deploy_summary.txt"

    # Add readable timestamp to the job summary
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    JOB_SUMMARY+="\n*Last updated: $TIMESTAMP UTC*\n"

    echo -e "$JOB_SUMMARY" > check_warp_deploy_summary.txt

    # Use a comment-tag to allow overwriting in subsequent runs
    COMMENT_TAG="Check Warp Deploy Summary"
    COMMENT_ID=$(gh api repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/comments --jq ".[] | select(.body | contains(\"$COMMENT_TAG\")) | .id")

    if [ -n "$COMMENT_ID" ]; then
        # Update the existing comment
        gh api repos/${GITHUB_REPOSITORY}/issues/comments/${COMMENT_ID} --method PATCH -F body=@check_warp_deploy_summary.txt
    else
        # Create a new comment with the tag if no existing comment is found
        echo -e "$COMMENT_TAG\n$(cat check_warp_deploy_summary.txt)" > check_warp_deploy_summary.txt
        gh pr comment $PR_NUMBER --body-file=check_warp_deploy_summary.txt
    fi
fi

exit $EXIT_CODE
