#!/usr/bin/env bash
# Build docker images script, with options
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

  echo "Building from $1 in $2 image version ${SUBTAG}${SUBTAG_EXTRA} ..."

  docker ${TL_TAG_BUILD_OPTS} \
    -f docker_rig/$1 \
    --build-arg VERSION="${TL_VERSION}" \
    --build-arg ${2^^}_VERSION=${SUBTAG} \
    $4 $5 $6 $7 $8 $9 \
    -t ${TL_TAG_URL}/$2:${SUBTAG}${SUBTAG_EXTRA} $3 ${TL_TAG_BUILD_Extra}
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

build_all_3dparty_images() {
  for element in "${arr3rdParty[@]}"; do
    build_3dparty_image $element.Dockerfile $element .
  done
}

build_all_tari_images() {
  for element in "${arrTariSuite[@]}"; do
    export $(jq --arg jsonVar "$element" -r '. [] | select(."image_name"==$jsonVar)
      | to_entries[] | .key + "=" + (.value | @sh)' tarisuite.json)
    build_tari_image $image_name \
      "$TL_VERSION_LONG" ./../.. \
      $app_name $app_exec
  done
}

build_all_images() {
  build_all_3dparty_images
  build_all_tari_images
}

# Quick overrides
if [ -f ".env.local" ]; then
  source ".env.local"
fi

#TL_TAG_BUILD_PF=amd64

# Version refers to the base_node, wallet, etc.
#  applications/tari_app_utilities/Cargo.toml
TL_VERSION=${TL_VERSION:-$(awk -F ' = ' '$1 ~ /version/ \
  { gsub(/["]/, "", $2); printf("%s",$2) }' "../tari_base_node/Cargo.toml")}

TBN_ARCH=${TBN_ARCH:-x86-64}
TBN_FEATURES=${TBN_FEATURES:-safe}

# Docker tag URL
TL_TAG_URL=${TL_TAG_URL:-quay.io/tarilabs}

# Docker build options
TL_TAG_BUILD_OPTS=${TL_TAG_BUILD_OPTS:-"build"}

#TL_VERSION_LONG="${TL_VERSION}-${TBN_ARCH}-${TBN_FEATURES}"
TL_VERSION_LONG=${TL_VERSION_LONG:-"${TL_VERSION}${TL_TAG_BUILD_PF}"}

# Sub Tag extra
#SUBTAG_EXTRA=${SUBTAG_EXTRA:-"-$TL_VERSION_LONG"}

arrAllTools=(  $(jq -r '.[].image_name' tarisuite.json 3rdparty.json) )
arrTariSuite=( $(jq -r '.[].image_name' tarisuite.json) )
arr3rdParty=(  $(jq -r '.[].image_name' 3rdparty.json) )

if [ -z "${1}" ]; then
  echo "Build all images with defaults"
  build_all_images
  exit 0
fi

# toLower
commandEnv="${1,,}"

case $commandEnv in
  -3 | 3rdparty )
    build_all_3dparty_images
    ;;
  -t | tari_ )
    build_all_tari_images
    ;;
  -a | all )
    build_all_images
    ;;
  -r | requirement | requirements )
    echo "List of requirements and possible test"
    jqVersion=$(jq --version)
    echo "jq is new - ${jqVersion}"
    ;;
  -h | -? | --help | help )
    echo "help"
    ;;
  *) echo "Invalid input"
    exit 1
    ;;
esac

exit 0
