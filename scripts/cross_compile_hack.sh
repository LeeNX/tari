#!/usr/bin/env bash
#
# hack cross-compile packages supprt into distro
#

set -e

USAGE="Usage: $0 target build ie: x86_64-unknown-linux-gnu or aarch64-unknown-linux-gnu"

if [ "$#" == "0" ]; then
  echo "$USAGE"
  exit 1
fi

if [ -z "${CROSS_DEB_ARCH}" ]; then
  echo "Should be run from cross, which sets the env CROSS_DEB_ARCH"
  exit 1
fi

# only Linux build - target
# x86_64-unknown-linux-gnu

echo "opt ${1}"
targetBuild="${1}"

#uname -a

#1=arm
#2=amd
#3=x86-64

#nativeArch=arm64
#uname -m
nativeRunTime=$(uname -m)
echo "Native RunTime is ${nativeRunTime}"

# only Linux build - target
# x86_64-unknown-linux-gnu
# aarch64-unknown-linux-gnu

if [ "${nativeRunTime}" == "x86_64" ]; then
  nativeArch=amd64
  if [ "${targetBuild}" == "aarch64-unknown-linux-gnu" ]; then
    targetArch=arm64
    targetPlatform=aarch64
  else
    targetArch=amd64
    targetPlatform=x86-64
  fi
elif [ "${nativeRunTime}" == "aarch64" ]; then
  nativeArch=arm64
  if [ "${targetBuild}" == "x86_64-unknown-linux-gnu" ]; then
    targetArch=x86-64

  fi
elif [ "${nativeRunTime}" == "riscv64" ]; then
  nativeArch=riscv64
  echo "ToDo!"
else
  echo "!!Unsupport platform!!"
  exit 1
fi

#crossArch=amd64
crossArch=${CROSS_DEB_ARCH}

apt-get update

# Base install packages
# scripts/install_ubuntu_dependencies.sh
apt-get install --no-install-recommends --assume-yes \
  apt-transport-https \
  ca-certificates \
  curl \
  gpg \
  bash \
  less \
  openssl \
  libssl-dev \
  pkg-config \
  libsqlite3-dev \
  libsqlite3-0 \
  libreadline-dev \
  git \
  cmake \
  dh-autoreconf \
  clang \
  libc++-dev \
  libc++abi-dev \
  libprotobuf-dev \
  protobuf-compiler \
  libncurses5-dev \
  libncursesw5-dev \
  libudev-dev \
  zip

# Install rust
mkdir -p "$HOME/.cargo/bin/"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PATH="$HOME/.cargo/bin:$PATH"
. "$HOME/.cargo/env"

printenv

# Cross-CPU setup
if [ "${CROSS_DEB_ARCH}" != "${nativeArch}" ]; then
  echo "Setup Cross CPU Compile ..."
  sed -i.save -e "s/^deb\ http/deb [arch="${nativeArch}"] http/g" /etc/apt/sources.list

  if [ "${crossArch}" == "arm64" ]; then
    cat << EoF > /etc/apt/sources.list.d/bionic-${crossArch}.list
deb [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic main restricted universe multiverse
# deb-src [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic main restricted universe multiverse

deb [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic-updates main restricted universe multiverse
# deb-src [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic-updates main restricted universe multiverse

deb [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic-backports main restricted universe multiverse
# deb-src [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic-backports main restricted universe multiverse

deb [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic-security main restricted universe multiverse
# deb-src [arch=${crossArch}] http://ports.ubuntu.com/ubuntu-ports bionic-security main restricted universe multiverse

deb [arch=${crossArch}] http://archive.canonical.com/ubuntu bionic partner
# deb-src [arch=${crossArch}] http://archive.canonical.com/ubuntu bionic partner
EoF
  fi

  if [ "${crossArch}" == "amd64" ]; then
    cat << EoF > /etc/apt/sources.list.d/bionic-${crossArch}.list
deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic main restricted
# deb-src http://archive.ubuntu.com/ubuntu/ bionic main restricted

deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic-updates main restricted
# deb-src http://archive.ubuntu.com/ubuntu/ bionic-updates main restricted

deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic universe
# deb-src http://archive.ubuntu.com/ubuntu/ bionic universe
deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic-updates universe
# deb-src http://archive.ubuntu.com/ubuntu/ bionic-updates universe

deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic multiverse
# deb-src http://archive.ubuntu.com/ubuntu/ bionic multiverse
deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic-updates multiverse
# deb-src http://archive.ubuntu.com/ubuntu/ bionic-updates multiverse

deb [arch=amd64] http://archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse
# deb-src http://archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse

# deb http://archive.canonical.com/ubuntu bionic partner
# deb-src http://archive.canonical.com/ubuntu bionic partner

deb [arch=amd64] http://security.ubuntu.com/ubuntu/ bionic-security main restricted
# deb-src http://security.ubuntu.com/ubuntu/ bionic-security main restricted
deb [arch=amd64] http://security.ubuntu.com/ubuntu/ bionic-security universe
# deb-src http://security.ubuntu.com/ubuntu/ bionic-security universe
deb [arch=amd64] http://security.ubuntu.com/ubuntu/ bionic-security multiverse
# deb-src http://security.ubuntu.com/ubuntu/ bionic-security multiverse
EoF
  fi

  echo "Sources ..."
  cat /etc/apt/sources.list
  echo "Cross-compile target ..."
  cat /etc/apt/sources.list.d/bionic-${crossArch}.list

  dpkg --add-architecture ${CROSS_DEB_ARCH}

  apt-get update

#    zlib1g \

  # scripts/install_ubuntu_dependencies-cross_compile.sh x86-64
  apt-get --assume-yes install \
    pkg-config-${targetPlatform}-linux-gnu \
    gcc-${targetPlatform}-linux-gnu \
    g++-${targetPlatform}-linux-gnu

  apt-get --assume-yes install \
    libhidapi-dev:${CROSS_DEB_ARCH}

fi

rustup target add ${targetBuild}
rustup toolchain install stable-${targetBuild} --force-non-host

rustup target list
rustup toolchain list
