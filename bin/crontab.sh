#!/usr/bin/env bash
#####################################################################################################
# * * * * * /usr/bin/env bash /www/api_server/bin/crontab.sh >> /www/api_server/logs/crontab.log 2>&1
#####################################################################################################
RUNNING=$(/www/api_server/bin/__service.sh status | grep -v not)
if [ "empty${RUNNING}" = "empty" ]; then
    /www/api_server/bin/service.sh start
fi