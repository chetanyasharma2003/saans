#!/bin/bash

echo "🔍 Checking GitHub Actions workflow status..."

# Get latest workflow run
LATEST_RUN=$(gh run list --limit 1 --json status,conclusion,name --jq '.[0]')

echo "Latest workflow:"
echo "$LATEST_RUN" | jq '.'

echo ""
echo "To view full logs:"
echo "gh run view $(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')"
