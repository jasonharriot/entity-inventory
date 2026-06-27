#!/bin/bash

cd $(dirname $0)

echo "Entity Inventory server @ $(date)"

echo "I am $(whoami)"

#Load NVM here so we can use version 22 or whatever we need

. ~/.nvm/nvm.sh

echo "Node version $(node --version)"

node index.js