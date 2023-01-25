# Leto.gg(gateway.leto.gg) 

> A caching layer built for the leto metrics engine(this repo currently is using the configuration built by NFT.Storage)

This repo was originally written by the team at NFT.Storage. Big thanks to them for making this project possible!

## Getting started

## Bad-Bits Denylist Script for automated removal

    #!/bin/bash

    # specify the path to the default IPFS storage directory
    IPFS_STORAGE_DIR="~/.ipfs"

    # specify the deny-list file containing the CIDs of the files to be removed
    DENY_LIST_FILE="deny-list.json"

    # read the deny-list file
    CIDS=$(jq -r '.[]' $DENY_LIST_FILE)

    # loop through the CIDs in the deny-list file
    for CID in $CIDS; do
    # run the ipfs pin rm command to remove each CID
    ipfs pin rm $CID
    
- NOTE: Script Accessibility(you need to make sure the script can read the bad-bits file in regards to the filesystem the bad-bits.json file. 
done

