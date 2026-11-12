#!/bin/sh
# Install the pnpm version pinned in package.json "packageManager", so CI and Docker images
# can never drift from what Renovate keeps up to date. Fails if the field is missing or
# names another manager. POSIX sh on purpose: the alpine node images have no bash.
# Needs node and npm. Reads package.json from the directory above this script.
set -eu

pkg="$(cd "$(dirname "$0")/.." && pwd)/package.json"
pm="$(node -p "require('$pkg').packageManager || ''")"

case "$pm" in
  pnpm@*) ;;
  *) echo "ERROR: expected pnpm@x.y.z in $pkg packageManager, got '${pm}'" >&2; exit 1 ;;
esac

version="${pm#pnpm@}"
version="${version%%+*}" # drop +sha512... integrity suffix

echo "Installing pnpm@${version} (from package.json packageManager)"
npm install -g "pnpm@${version}"
