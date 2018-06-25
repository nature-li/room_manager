#!/usr/bin/env python2.7
# coding: utf-8

import os
import sys
import traceback
import configparser
from py_log.logger import Logger, LogEnv


class Config(object):
    # 日志配置
    LOG_ENV = None
    LOG_TARGET = ''
    LOG_NAME = ''
    LOG_SIZE = 100 * 1024 * 1024
    LOG_COUNT = 100
    # 服务配置
    LISTEN_HOST = '0.0.0.0'
    LISTEN_PORT = 8888
    DEBUG_MODE = False
    FAKE_LOGIN = False
    LOGIN_COOKIE_SECRET = 'write_a_long_mess_string'
    LOGIN_EXPIRE_TIME = 900
    PUBLIC_KEY_FILE = ''
    # OA登录
    OAUTH_APP_ID = ''
    OAUTH_APP_SECRET = ''
    OAUTH_REDIRECT_URL = ''
    OAUTH_TOKEN_URL = ''
    OAUTH_USER_URL = ''
    OAUTH_AUTH_URL = ''
    # MySQL
    DB_HOST = ''
    DB_PORT = 3306
    DB_USER = ''
    DB_PWD = ''
    DB_NAME = ''
    # 监控服务地址
    MONITOR_URL = 'http://127.0.0.1:12345'

    @classmethod
    def log_config(cls):
        try:
            Logger.info("mysql_host=[%s]" % cls.DB_HOST)
            Logger.info("mysql_port=[%s]" % cls.DB_PORT)
        except:
            print traceback.format_exc()

    @classmethod
    def parse_log_env(cls, log_env):
        if log_env == 'develop':
            return LogEnv.develop
        elif log_env == 'abtest':
            return LogEnv.abtest
        elif log_env == 'product':
            return LogEnv.product
        else:
            print 'invalid log_env. possible value: develop, abtest, product'
            sys.exit(-1)

    @classmethod
    def init(cls, ini_file):
        try:
            config = configparser.ConfigParser(os.environ)
            config.read(ini_file)
            # Parse log config
            cls.LOG_ENV = cls.parse_log_env(config.get('log', 'environment', raw=True))
            cls.LOG_TARGET = config.get('log', 'target')
            cls.LOG_NAME = config.get('log', 'file_name', raw=True)
            cls.LOG_SIZE = config.getint('log', 'file_size', raw=True)
            cls.LOG_COUNT = config.getint('log', 'file_count', raw=True)
            # Parse server config
            cls.LISTEN_HOST = config.get('server', 'listen_host', raw=True)
            cls.LISTEN_PORT = config.getint('server', 'listen_port', raw=True)
            cls.LOGIN_COOKIE_SECRET = config.get('server', 'login_cookie_secret', raw=True)
            cls.LOGIN_EXPIRE_TIME = config.getint('server', 'login_expire_time', raw=True)
            cls.PUBLIC_KEY_FILE = config.get('server', 'public_key_file')
            # Parse OAUTH
            cls.OAUTH_APP_ID = config.get('oauth', 'app_id', raw=True)
            cls.OAUTH_APP_SECRET = config.get('oauth', 'app_secret', raw=True)
            cls.OAUTH_REDIRECT_URL = config.get('oauth', 'redirect_url', raw=True)
            cls.OAUTH_TOKEN_URL = config.get('oauth', 'token_url', raw=True)
            cls.OAUTH_USER_URL = config.get('oauth', 'user_url', raw=True)
            cls.OAUTH_AUTH_URL = config.get('oauth', 'auth_url', raw=True)
            # Parse MySQL
            cls.DB_HOST = config.get('mysql', 'mysql_host', raw=True)
            cls.DB_PORT = config.getint('mysql', 'mysql_port', raw=True)
            cls.DB_USER = config.get('mysql', 'mysql_user', raw=True)
            cls.DB_PWD = config.get('mysql', 'mysql_pwd', raw=True)
            cls.DB_NAME = config.get('mysql', 'mysql_db', raw=True)
            # Parse monitor server
            cls.MONITOR_URL = config.get('monitor', 'server_url', raw=True)
            # Debug mode
            cls.DEBUG_MODE = bool(config.getint('debug', 'debug_mode', raw=True))
            cls.FAKE_LOGIN = bool(config.getint('debug', 'fake_login', raw=True))
            return True
        except:
            print traceback.format_exc()

    @classmethod
    def check(cls):
        try:
            if not cls.LOGIN_COOKIE_SECRET:
                print "[login_cookie_secret] can not be empty"
                return False
            if cls.LOGIN_EXPIRE_TIME <= 0:
                print '[login_expire_time] must be greater than 0'
                return False
            return True
        except:
            print traceback.format_exc()
