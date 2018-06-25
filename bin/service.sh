#!/usr/bin/env bash

# expected run user
RUN_USER="ads"

# root user
ROOT_USER="root"

# current user
CUR_USER=`whoami`

# bin path
BIN_PATH=$(cd $(dirname $0) && pwd)

# root path
ROOT_PATH=`dirname ${BIN_PATH}`

# raw service
RAW_SERVICE=${ROOT_PATH}/bin/__service.sh

start() {
    if [ ${CUR_USER} = ${RUN_USER} ]; then
        # start program as expected user
        ${RAW_SERVICE} start
    elif [ ${CUR_USER} = ${ROOT_USER} ]; then
        # start program as root user
        sudo -u ${RUN_USER} ${RAW_SERVICE} start
    else
        # start program error
        echo "[$CUR_USER] is not a permitted user, you must be [${RUN_USER}] or [${ROOT_USER}]"
    fi
}

stop() {
    if [ ${CUR_USER} = ${RUN_USER} ]; then
        # stop program as expected user
        ${RAW_SERVICE} stop
    elif [ ${CUR_USER} = ${ROOT_USER} ]; then
        # stop program as root user
        sudo -u ${RUN_USER} ${RAW_SERVICE} stop
    else
        # stop program error
        echo "[$CUR_USER] is not a permitted user, you must be [${RUN_USER}] or [${ROOT_USER}]"
    fi
}

status() {
    if [ ${CUR_USER} = ${RUN_USER} ]; then
        # stop program as expected user
        ${RAW_SERVICE} status
    elif [ ${CUR_USER} = ${ROOT_USER} ]; then
        # stop program as root user
        sudo -u ${RUN_USER} ${RAW_SERVICE} status
    else
        # stop program error
        echo "[$CUR_USER] is not a permitted user, you must be [${RUN_USER}] or [${ROOT_USER}]"
    fi
}

debug() {
    if [ ${CUR_USER} = ${RUN_USER} ]; then
        # debug program as expected user
        ${RAW_SERVICE} debug
    elif [ ${CUR_USER} = ${ROOT_USER} ]; then
        # debug program as root user
        sudo -u ${RUN_USER} ${RAW_SERVICE} debug
    else
        # debug program error
        echo "[$CUR_USER] is not a permitted user, you must be [${RUN_USER}] or [${ROOT_USER}]"
    fi
}

restart() {
    if [ ${CUR_USER} = ${RUN_USER} ]; then
        # restart program as expected user
        ${RAW_SERVICE} restart
    elif [ ${CUR_USER} = ${ROOT_USER} ]; then
        # restart program as root user
        sudo -u ${RUN_USER} ${RAW_SERVICE} restart
    else
        # restart program error
        echo "[$CUR_USER] is not a permitted user, you must be [${RUN_USER}] or [${ROOT_USER}]"
    fi
}


case "$1" in
    'debug')
        debug
        ;;
    'start')
        start
        ;;
   'stop')
        stop
        ;;
   'restart')
        restart
        ;;
   'status')
        status
        ;;
   *)
        echo "Usage: $0 {debug|start|stop|restart|status}"
        exit 1
esac