#!/bin/bash

# specify the URL of the denylist.json file
URL="http://badbits.dwebops.pub.ipns.localhost:8080/denylist.json"

# download the denylist.json file
curl -o denylist.json $URL