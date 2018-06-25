#!/usr/bin/env python2.7
# coding: utf-8

import requests
import traceback
from py_log.logger import Logger
from config.config import Config


class Login(object):
    @classmethod
    def get_access_token(cls, code):
        try:
            a_dict = {
                'code': code,
                'appid': Config.OAUTH_APP_ID,
                'appsecret': Config.OAUTH_APP_SECRET,
                'redirect_uri': Config.OAUTH_REDIRECT_URL,
                'grant_type': 'auth_code',
            }
            r = requests.post(Config.OAUTH_TOKEN_URL, a_dict)
            if r.status_code != 200:
                Logger.error("get_access_token error, status_code[%s], content[%s]" % (r.status_code, r.content))
            return r.status_code, r.content
        except:
            Logger.error(traceback.format_exc())
            return None, None

    @classmethod
    def get_user_info(cls, token, open_id):
        try:
            a_dict = {
                'access_token': token,
                'appid': Config.OAUTH_APP_ID,
                'openid': open_id
            }
            r = requests.post(Config.OAUTH_USER_URL, a_dict)
            if r.status_code != 200:
                Logger.error("get_user_info error, status_code[%s], content[%s]" % (r.status_code, r.content))
            return r.status_code, r.content
        except:
            Logger.error(traceback.format_exc())
            return None, None
