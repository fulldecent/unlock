#!/usr/bin/env bash

# This script builds the corresponding images
# The argument is the image name
# When a DOCKER_REPOSITORY is available we will first pull it from AWS where the cached images are stored

IMAGE_NAME=$1
REPO_ROOT=`dirname "$0"`/..
DOCKERFILE=$REPO_ROOT/docker/$IMAGE_NAME.dockerfile
ARGS=""

if [ "$DOCKER_REPOSITORY" != "" ]; then
  # if we have a repo, let's pull the image from there
  IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:latest"
  docker pull $IMAGE_CACHE;
elif [ -f ${CACHE_DIR} ]; then
  # If we have a cache, let's try to load the image from there
  CACHE_FILE="${CACHE_DIR}/$IMAGE_NAME.tar.gz"
  if [ -f ${CACHE_FILE} ]; then
    gunzip -c ${CACHE_FILE} | docker load
  fi
  IMAGE_CACHE="$IMAGE_NAME:latest"
else
  IMAGE_CACHE="$IMAGE_NAME:latest"
fi

ARGS="$ARGS --cache-from $IMAGE_CACHE"

docker build -t $IMAGE_NAME -f $DOCKERFILE $ARGS $REPO_ROOT
