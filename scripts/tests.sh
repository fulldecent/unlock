#!/usr/bin/env bash

# this script runs the test in the service provided as first argument
# It first pulls the images and then builds the cluster

SERVICE=$1
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="npm run ci"
IMAGE_NAME="unlock"
IMAGE_TAG="build-$TRAVIS_BUILD_ID"
IMAGE_CACHE="$IMAGE_NAME:$IMAGE_TAG" # default

if [ "$DOCKER_REPOSITORY" != "" ]; then
  IMAGE_CACHE="$DOCKER_REPOSITORY/$IMAGE_NAME:$IMAGE_TAG"
  echo "Pulling $IMAGE_CACHE to use as cache for $IMAGE_NAME"
  docker pull $IMAGE_CACHE
fi
docker tag $IMAGE_CACHE $IMAGE_NAME

docker-compose -f $DOCKER_COMPOSE_FILE build
docker-compose -f $DOCKER_COMPOSE_FILE run -e CI=true $SERVICE $COMMAND
