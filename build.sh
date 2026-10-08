#!/bin/sh
# Rebuild index.html from the source pieces in src/
cd "$(dirname "$0")" && cat src/head.html src/plants-data.js src/plates-new.js src/tail.js > index.html
