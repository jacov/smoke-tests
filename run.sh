#!/usr/bin/env bash

TIMESTAMP=$(date +%s)
ENV="PROD"

for i in "$@"
do
case $i in
    -e=*|--env=*)
    ENV="${i#*=}"
    ;;
    *)
    # unknown option
    ;;
esac
done

if [ "${ENV}" == "TEST" ]; then
    SITES="https://dtodss.test-govcms.acsitefactory.com/ https://govcms.test-govcms.acsitefactory.com/ https://asada.test-govcms.acsitefactory.com/"
else
    SITES="https://www.dto.gov.au/ https://www.govcms.gov.au/ https://www.asada.gov.au/"
fi

# Kick off CasperJS.
casperjs test test.js --sites="${SITES}" --timestamp=${TIMESTAMP} --ignore-ssl-errors=true --includes=functions.js --xunit=log.xml
