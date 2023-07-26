#!/bin/bash

# This script is called from within the Docker container created by build.sh.
# Run build.sh instead. Don't run this script directly.

# save the checked out commit hash, sometimes helpful for debugging
git rev-parse HEAD > .git-hash

# install dependencies and build
npm install
npm run build

# create a ZIP that we can upload to Chrome Web Store
zip -r /workdir/leetify-gcpd-upload.zip \
	.git-hash \
	assets \
	dist \
	manifest.json \
	src \
	types
