#!/bin/bash

cd $(dirname $0)

echo "Entity Inventory server @ $(date)"


#Load NVM here so we can use version 22 or whatever we need

. ~/.nvm/nvm.sh

node index.js