#!/usr/bin/env bash

# this script runs the test in the service provided as first argument
# It first pulls the images and then builds the cluster

SERVICE=$1
PUSHED_IMAGE=$2
REPO_ROOT=`dirname "$0"`/..
DOCKER_COMPOSE_FILE=$REPO_ROOT/docker/docker-compose.ci.yml
COMMAND="npm run ci"

docker-compose -f $DOCKER_COMPOSE_FILE run -e CI=true $SERVICE $COMMAND
