#!/usr/bin/env bash
TIMESTAMP=$(date +%s)
SITES="https://Asada:Th2Jebre@asada.test-govcms.acsitefactory.com/ https://govcms.test-govcms.acsitefactory.com/ https://dtodss.test-govcms.acsitefactory.com/"

# Kick off CasperJS.
casperjs test test.js --sites="${SITES}" --timestamp=${TIMESTAMP} --ignore-ssl-errors=true --includes=functions.js --xunit=log.xml

