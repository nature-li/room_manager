#!/usr/bin/env bash

# set python path
PYTHON="/usr/bin/env python2.7"
##############################################
# VIRTUAL_PYTHON=""
# source "${VIRTUAL_PYTHON}/bin/activate"
# PYTHON="${VIRTUAL_PYTHON}/bin/python"
##############################################

# bin path
BIN_PATH=$(cd $(dirname $0) && pwd)

# root path
ROOT=$(dirname ${BIN_PATH})

# config path
CONFIG_PATH=${ROOT}/config

# server path
SERVER_PATH=${ROOT}/src

# log.out file
BIN_OUT=${BIN_PATH}/log.out

# daemon pid file
PID_FILE=${BIN_PATH}/daemon.pid

# server name
SERVER_NAME=RoomManager

# server file name
SERVER_SCRIPT=${SERVER_PATH}/room_manager.py

# config file
CONFIG_FILE=${CONFIG_PATH}/config.ini

# daemon pid
DAEMON_PID=0

# project
export APP_HOME=${ROOT}

# check and set pid to ${SERVER_PID}
check_pid() {
    DAEMON_PID_FROM_FILE=$(cat ${PID_FILE} 2>/dev/null)
    if [ "empty${DAEMON_PID_FROM_FILE}" != "empty" ]; then
        DAEMON_PID=$(ps aux | grep -v grep | grep ${SERVER_NAME} | grep ${DAEMON_PID_FROM_FILE} | awk '{print $2}')
        if [ "${DAEMON_PID_FROM_FILE}" != "${DAEMON_PID}" ]; then
            DAEMON_PID=0
        fi
    fi

    if [ "empty${DAEMON_PID}" == "empty" ]; then
        DAEMON_PID=0
    fi
}

# debug server
debug() {
    check_pid

    if [ ${DAEMON_PID} -ne 0 ]; then
        echo "======================================================================="
        echo "WARN: ${SERVER_NAME} already started! (pid=${DAEMON_PID})"
        echo "======================================================================="
        exit -1
    else
        echo "Starting ${SERVER_NAME} foreground..."
        ${PYTHON} ${SERVER_SCRIPT} --conf=${CONFIG_FILE}
    fi
}

# start server
start() {
    check_pid

    if [ ${DAEMON_PID} -ne 0 ]; then
        echo "======================================================================="
        echo "WARN: ${SERVER_NAME} already started! (pid=${DAEMON_PID})"
        echo "======================================================================="
    else
        nohup ${PYTHON} ${SERVER_SCRIPT} --conf=${CONFIG_FILE} 1>${BIN_OUT} >/dev/null 2>&1 < /dev/null &

        echo $! > ${PID_FILE}

        for ((number=1; number<10; number++)) {
            check_pid
            if [ ${DAEMON_PID} -ne 0 ]; then
                break
            fi
            echo "${SERVER_NAME} is starting ..."
            sleep 1
        }

        echo -n "Starting ${SERVER_NAME} ..."
        if [ ${DAEMON_PID} -ne 0 ]; then
            echo "(pid=${DAEMON_PID}) [OK]"
        else
            echo "[Failed]"
            exit -1
        fi
    fi
}

# stop server
stop() {
    check_pid

    if [ ${DAEMON_PID} -ne 0 ]; then
        echo -n "Send signal to ${SERVER_NAME} ...(pid=${DAEMON_PID}) "
        kill -TERM ${DAEMON_PID}
        if [ $? -eq 0 ]; then
             echo "[OK]"
        else
            echo "[Failed]"
        fi

        while true
        do
            check_pid
            if [ ${DAEMON_PID} -ne 0 ]; then
                echo "Waiting ${SERVER_NAME} to stop ...(pid=${DAEMON_PID}) "
                sleep 1
            else
                break
            fi
        done
        echo "${SERVER_NAME} is stopped...(pid=${DAEMON_PID}) "
   else
        echo "======================================================================="
        echo "WARN: ${SERVER_NAME} is not running"
        echo "======================================================================="
   fi
}

# get server status
status() {
    check_pid

    if [ ${DAEMON_PID} -ne 0 ];  then
        echo "${SERVER_NAME} is running! (pid=${DAEMON_PID})"
    else
        echo "${SERVER_NAME} is not running"
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
        stop
        start
        ;;
   'status')
        status
        ;;
   *)
        echo "Usage: $0 {debug|start|stop|restart|status}"
        exit 1
esac