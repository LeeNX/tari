## Some running notes and script

# Set release - Can be pulled from tari.com/download page
# tari_suite - version - testNet release - git commit hash - platform target ([macos/linux]-[x86_64/arm64])
# https://tari-binaries.s3.amazonaws.com/current/osx/nextnet/tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64.zip.sha256
export tsv=tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64

# Setup folder structure - use the date stamp as the top level
export mtsdate=$(date +"%Y-%m-%d")
mkdir ${mtsdate}
cd ${mtsdate}

# Get tari suite archive
mkdir zip
cd zip
wget https://tari-binaries.s3.amazonaws.com/current/osx/nextnet/${tsv}.zip.sha256
wget https://tari-binaries.s3.amazonaws.com/current/osx/nextnet/${tsv}.zip
shasum -c ${tsv}.zip.sha256
cd ..

# Check shasums
mkdir bins
cd bins
unzip ../zip/${tsv}.zip
shasum -c ${tsv}.sha256
cd ..

# Run minotari node with data in tari folder
./bins/minotari_node -b ./tari/

```
Node config does not exist.
Would you like to mine (Y/n)?
NOTE: this will enable additional gRPC methods that could be used to monitor and submit blocks from this node.
```

# Answer yes

```
Initializing logging according to "./tari/nextnet/config/base_node/log4rs.yml"
Node identity does not exist.
Would you like to create one (Y/n)?
```

# Answer yes

# node is running ...
