#!/usr/bin/env bash

# First this script will deploy from an instance of unlock:latest
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
IMAGE_TAG="build-$TRAVIS_BUILD_ID"

# We need to pull both the unlock image and the integration test images
if [ "$DOCKER_REPOSITORY" != "" ]; then
  for IMAGE_NAME in "unlock" "unlock-integration"; do
    IMAGE_CACHE="$IMAGE_NAME:$IMAGE_TAG" # default
    IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:$IMAGE_TAG"
    echo "Pulling $IMAGE_CACHE to use as cache for $IMAGE_NAME"
    docker pull $IMAGE_CACHE
    docker tag $IMAGE_CACHE $IMAGE_NAME
  done
fi


# Build the cluster
docker-compose -f $DOCKER_COMPOSE_FILE build

# Run the tests
COMMAND="npm run ci"
docker-compose -f $DOCKER_COMPOSE_FILE run integration-tests bash -c "$COMMAND"
