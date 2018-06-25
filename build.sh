#!/usr/bin/env bash
set -ex
APP_NAME=room_manager
ROOT=$(cd $(dirname ${0}) && pwd)
###############################################
# the following is make rpm package
###############################################
# make rpm package
cd ${ROOT}
sh ${ROOT}/rpm/rpm_build.sh ${ROOT}/rpm/m_engine.spec