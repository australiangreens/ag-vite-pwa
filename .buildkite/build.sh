#!/usr/bin/env bash
set -e

cd /app
# node_modules comes from the deps step's artifact, so there is no install here.
pnpm build

# Show exactly what would be published, so a bad `files` list fails in CI, not on npm.
pnpm pack --dry-run
