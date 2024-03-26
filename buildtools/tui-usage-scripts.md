# https://asciinema.org/
```bash
asciinema rec minotari-node-setup.cast

export mtsdate=$(date +"%Y-%m-%d")
mkdir ${mtsdate}
cd ${mtsdate}

mkdir zip
cd zip
wget https://tari-binaries.s3.amazonaws.com/current/osx/nextnet/tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64.zip.sha256 
wget https://tari-binaries.s3.amazonaws.com/current/osx/nextnet/tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64.zip
shasum -c tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64.zip.sha256 
cd ..

mkdir bins
cd bins
unzip ../zip/tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64.zip
shasum -c tari_suite-1.0.0-rc.6a-5f56caa-macos-x86_64.sha256
cd ..

#TARI_BASE_NODE__USE_LIBTOR=false 
./bins/minotari_node -b ./tari/
```
