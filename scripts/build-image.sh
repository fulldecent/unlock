#!/usr/bin/env bash

# This script builds the corresponding images
# The argument is the image name
# When a DOCKER_REPOSITORY is available we will first pull it from AWS where the cached images are stored
# When called with a second argument, will push the image under this tag too

IMAGE_NAME=$1
PUSH_IMAGE=$2
REPO_ROOT=`dirname "$0"`/..
DOCKERFILE=$REPO_ROOT/docker/$IMAGE_NAME.dockerfile
ARGS=""
DOCKER_TAG="build-$TRAVIS_BUILD_ID"

if [ "$DOCKER_REPOSITORY" != "" ]; then
  IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:latest"
  echo "Pulling $IMAGE_CACHE to use as cache for $IMAGE_NAME"
  docker pull $IMAGE_CACHE;
else
  IMAGE_CACHE="$IMAGE_NAME:latest"
fi

ARGS="$ARGS --cache-from $IMAGE_CACHE"

docker build -t $IMAGE_NAME:$DOCKER_TAG -f $DOCKERFILE $ARGS $REPO_ROOT

if [ "$PUSH_IMAGE" = "true" ]; then
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  IMAGE_TO_PUSH="$DOCKER_REPOSITORY/$IMAGE_NAME:$DOCKER_TAG"
  docker tag "$IMAGE_NAME:$DOCKER_TAG" $IMAGE_TO_PUSH
  docker push $IMAGE_TO_PUSH
fi
