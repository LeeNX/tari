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

build_3dparty_image_json() {
# $1 json image_name
  build_3dparty_image $1.Dockerfile $1 .
}

build_all_3dparty_images() {
  for element in "${arr3rdParty[@]}"; do
    build_3dparty_image_json $element
  done
}

build_tari_image_json() {
# $1 json image_name

#  export $(jq --arg jsonVar "$1" -r '. [] | select(."image_name"==$jsonVar)
#    | to_entries[] | .key + "=" + (.value | @sh)' tarisuite.json)
  export $(jq --arg jsonVar "$1" -r '. [] | select(."image_name"==$jsonVar)
    | to_entries[] | .key + "=" + .value' tarisuite.json)
  build_tari_image $image_name \
    "$TL_VERSION_LONG" ./../.. \
    $app_name $app_exec
}

build_all_tari_images() {
  for element in "${arrTariSuite[@]}"; do
    build_tari_image_json $element
  done
}

build_all_images() {
  build_all_3dparty_images
  build_all_tari_images
}

build_help_info() {
  echo "$0 used to build docker images"
  echo "USAGE: "
  echo "  $0 < -a > or < all > or < without any options > | build all images with current default environment varibles"
  echo "  $0 < -3 > | build 3rd Party images"
  echo "  $0 < -t > | build Tari suite images"
  echo "  $0 < -l > | list images that can be built"
  echo "  $0 < -b image_name > | build an image"
  echo "  $0 < -h > | this help info"
}

build_help_images() {
  echo "List all images that can be built:"
  echo " ${arr3rdParty[@]}"
  echo " ${arrTariSuite[@]}"
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
  build | -b )
    echo "Build a docker image"
    shift
    if [[ ${arrAllTools[*]} =~ (^|[[:space:]])"${1}"($|[[:space:]]) ]]; then
      echo "Found $1"
      if [ "${1:0:5}" == "tari_" ]; then
        build_tari_image_json $1
      else
        build_3dparty_image_json $1
      fi
    else
      echo "Not found $1"
      build_help_info
      build_help_images
      exit 2
    fi
    ;;
  -l | ls )
    build_help_images
    ;;
  -r | requirement | requirements )
    echo "List of requirements and possible test:"
    jqVersion=$(jq --version)
    echo "jq is new - ${jqVersion}"
    ;;
  -h | -? | --help | help )
    build_help_info
    ;;
  *) echo "Invalid input"
    exit 1
    ;;
esac

exit 0
