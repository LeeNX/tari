#!/bin/bash
# setup envs based on tag passed
tagnet=$1
echo $tagnet
# case match is not RegEx, but wildcards/globs
case "$tagnet" in
v*-pre.*)
  echo "esme"
  export TARI_NETWORK=esme
  export TARI_NETWORK_DIR=testnet
  export TARI_NETWORK_CHANGELOG=development
  ;;
v*-rc.*)
  echo "nextnet" 
  export TARI_NETWORK=nextnet
  export TARI_NETWORK_DIR=nextnet
  export TARI_NETWORK_CHANGELOG=nextnet
  ;;
*)
  echo "mainnet"
  export TARI_NETWORK=mainnet
  export TARI_NETWORK_DIR=mainnet
  ;;
esac
