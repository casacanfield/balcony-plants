#!/bin/sh
# Rebuild index.html from the source pieces in src/
# (which plants are in which pot lives in pots.json, edited from the plant list's Pots view)
cd "$(dirname "$0")" && cat src/head.html src/plants-data.js src/plates-new.js src/pots-editor.js src/tail.js > index.html
