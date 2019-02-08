
#!/usr/bin/env bash

# This script saves a docker image in the local cache directory, only if the build was:
# 1. successful
# 2. on master
# 3. not from a pull request

IMAGE_NAME=$1
CACHE_FILE="${CACHE_DIR}/$IMAGE_NAME.tar.gz"

if [[ $TRAVIS_TEST_RESULT = 0 ]]; then
  if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then
    mkdir -p $CACHE_DIR
    docker save $IMAGE_NAME:latest | gzip > $CACHE_FILE
  fi
fi
