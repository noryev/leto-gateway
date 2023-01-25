#!/bin/bash

# specify the path to the default IPFS storage directory
IPFS_STORAGE_DIR="~/.ipfs"

# specify the deny-list file containing the CIDs of the files to be removed
DENY_LIST_FILE="/path/to/deny-list.json"

# read the deny-list file
CIDS=$(jq -r '.[]' $DENY_LIST_FILE)

# loop through the CIDs in the deny-list file
for CID in $CIDS; do
    # run the ipfs pin rm command to remove each CID
    ipfs pin rm $CID
done

