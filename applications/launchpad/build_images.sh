#!/bin/bash
#
#
#

set -e

build_3dparty_image() {
# $1 dockerfile
# $2 image name
# $3 build from path
# $4 subtag - if not set, extracted from dockerfile ie: TOR_VERSION

  if [ -f "docker_rig/$1" ]; then
    if [ -z "$4" ]; then
      SUBTAG=$(awk -v search="^ARG ${2^^}?_VERSION=" -F '=' '$0 ~ search \
        { gsub(/["]/, "", $2); printf("%s",$2) }' \
        "docker_rig/$1")
    else
      SUBTAG=$4
    fi
  else
    echo "No docker file docker_rig/$1"
    exit 1
  fi

  echo "Building from $1 in $2 image version $SUBTAG ..."

  docker ${TL_TAG_BUILD_OPTS} \
    -f docker_rig/$1 \
    --build-arg VERSION="${TL_VERSION}" \
    --build-arg ${2^^}_VERSION=${SUBTAG} \
    $4 $5 $6 $7 $8 $9 \
    -t ${TL_TAG_URL}/$2:${SUBTAG} $3 ${TL_TAG_BUILD_Extra}
}

build_tari_image() {
# $1 image name
# $2 image tag
# $3 build from path
# $4 APP_NAME ie: base_node
# $5 APP_EXEC ie: tari_base_node

  echo "Building from tarilabs.Dockerfile in $1 image version $2 ..."
  docker ${TL_TAG_BUILD_OPTS} \
    -f docker_rig/tarilabs.Dockerfile \
    --build-arg ARCH=${TBN_ARCH} \
    --build-arg FEATURES=${TBN_FEATURES} \
    --build-arg VERSION=$2 \
    --build-arg APP_NAME=$4 \
    --build-arg APP_EXEC=$5 \
    $6 $7 $8 $9 \
    -t ${TL_TAG_URL}/$1:$2 $3 ${TL_TAG_BUILD_Extra}
}

#TL_TAG_BUILD_PF=amd64

# Version refers to the base_node, wallet, etc.
#  applications/tari_app_utilities/Cargo.toml
TL_VERSION=${TL_VERSION:-$(awk -F ' = ' '$1 ~ /version/ \
  { gsub(/["]/, "", $2); printf("%s",$2) }' "../tari_base_node/Cargo.toml")}

TBN_ARCH=${TBN_ARCH:-x86-64}
TBN_FEATURES=${TBN_FEATURES:-safe}

# Docker tag URL
TL_TAG_URL=${TL_TAG_URL:-local/tarilabs}

# Docker build options
TL_TAG_BUILD_OPTS=${TL_TAG_BUILD_OPTS:-"build"}

# 5min package build
build_3dparty_image tor.Dockerfile tor .

# 15min binary build
build_3dparty_image monerod.Dockerfile monerod .

# 45min source build
build_3dparty_image  xmrig.Dockerfile xmrig .

#TL_VERSION_LONG="${TL_VERSION}-${TBN_ARCH}-${TBN_FEATURES}"
TL_VERSION_LONG=${TL_VERSION_LONG:-"${TL_VERSION}${TL_TAG_BUILD_PF}"}

build_tari_image tari_base_node \
  "$TL_VERSION_LONG" ./../.. \
  base_node tari_base_node

build_tari_image tari_console_wallet \
  "$TL_VERSION_LONG" ./../.. \
  wallet tari_console_wallet

build_tari_image tari_sha3_miner \
  "$TL_VERSION_LONG" ./../.. \
  sha3_miner tari_miner

build_tari_image tari_mm_proxy \
  "$TL_VERSION_LONG" ./../.. \
  mm_proxy tari_merge_mining_proxy
