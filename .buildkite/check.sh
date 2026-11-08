#!/usr/bin/env bash
set -e

cd /app
# node_modules comes from the deps step's artifact, so there is no install here.
pnpm checkall
