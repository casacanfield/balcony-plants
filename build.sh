#!/bin/sh
# Rebuild index.html and edit.html from the source pieces in src/
# (which plants are in which pot lives in pots.json, edited by edit.html)
cd "$(dirname "$0")" && cat src/head.html src/plants-data.js src/plates-new.js src/tail.js > index.html
sed -n '/^:root {/,/^\* { box-sizing/p' src/head.html | sed '$d' > src/.tokens.tmp
sed -e '/@@TOKENS@@/{r src/.tokens.tmp' -e 'd}' src/edit-head.html | cat - src/plants-data.js src/edit.js > edit.html
rm -f src/.tokens.tmp
