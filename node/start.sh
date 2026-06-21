#!/bin/bash

cd $(dirname $0)

echo "Entity Inventory server @ $(date)"

echo "I am $(whoami)"

#Load NVM here so we can use specific versions

. ~/.nvm/nvm.sh

nvm install 22
nvm use 22

echo "Node version $(node --version)"

node index.js
