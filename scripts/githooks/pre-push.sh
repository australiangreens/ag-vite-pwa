#!/bin/sh

echo "Running checkall..."
pnpm checkall || { echo "Error: checks failed"; exit 1; }
