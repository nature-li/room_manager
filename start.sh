#!/usr/bin/env bash


CURRENT_PATH=$(cd $(dirname $0) && pwd)
python src/room_manager.py --conf=config/config.ini