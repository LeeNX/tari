## Notes of tools and process for clean testing of packages for platforms and architecture

# Testing Linux x86-64 using VirtualBox and Vargrant
notes to follow

# Testing Linux arm64
Can use qemu for arm64, possible in docker or direct on x86-64 host. 

Setup process and notes for Raspberry Pi devices

# Testing OSX
Best to start with a clean machine for a complete testing solution

Newly wiped and installed Mac could be a solution, but would be slow and need extra hardware.

We can use virtualising tools that run on OSX, like Tart or UTM

# Tart
https://tart.run/

# UTM
https://mac.getutm.app/

# Focus on Tart  - https://tart.run/quick-start/
```bash
brew install cirruslabs/cli/tart
tart clone ghcr.io/cirruslabs/macos-sonoma-base:latest sonoma-base
tart run sonoma-base
```

# MacOS image repo
https://github.com/cirruslabs/macos-image-templates

# MacOS images listed
https://github.com/orgs/cirruslabs/packages?repo_name=macos-image-templates

## JFYI:
# Linux image repo
https://github.com/cirruslabs/linux-image-templates
# Linux image list 
https://github.com/orgs/cirruslabs/packages?repo_name=linux-image-templates


# Extra Tart - pkg testing

https://tart.run/quick-start/


# Has brew installed
# pulling disk (18.2 GB compressed)
tart clone ghcr.io/cirruslabs/macos-sonoma-base:latest sonoma-base


# Nothing installed
# pulling disk (15.5 GB compressed)
tart clone ghcr.io/cirruslabs/macos-sonoma-vanilla:latest sonoma-vanilla

tart run --dir=osx:./osx sonoma-vanilla

tart pull ghcr.io/cirruslabs/macos-monterey-vanilla:latest
tart pull ghcr.io/cirruslabs/macos-ventura-vanilla:latest
tart pull ghcr.io/cirruslabs/macos-sonoma-vanilla:latest

