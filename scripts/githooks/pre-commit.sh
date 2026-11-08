#!/bin/sh

echo -n "Confirming no '.only' tests..."
if test $(git diff --cached | grep -E "\b(it|describe|test|concurrent).only\(|\b(fit|fdescribe)\("  | wc -l) != 0; then
    echo "Error: no 'only' tests can be committed to source."
    exit 1
fi
echo "Done"

exit 0
