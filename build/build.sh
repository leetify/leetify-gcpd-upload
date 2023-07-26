#!/bin/bash

# This script builds a ZIP file for the extension that can be uploaded to Chrome Web Store.
#
# It clones the repository via file system (to avoid any gitignored files or uncommited changes),
# builds a Docker image with all dependencies installed,
# runs the package script in that container (which actually builds the ZIP; cf. package.sh),
# then deletes the image and clone.
#
# This isn't very clean, nor does it work on Windows, but it'll do for now.

cd "$(dirname "$0")"

if [ -d tmp ]; then
	rm -r tmp
fi

mkdir -p tmp
git clone --no-hardlinks .. tmp/clone

docker build -t leetify/tmp-build-leetify-gcpd-upload .

docker run \
	--rm \
	-u node \
	-v ./tmp:/workdir \
	-w /workdir/clone \
	leetify/tmp-build-leetify-gcpd-upload \
	sh /workdir/clone/build/package.sh

docker image rm leetify/tmp-build-leetify-gcpd-upload

rm -r tmp/clone
