#!/usr/bin/env python2.7
# coding: utf-8

import datetime
import json
import traceback
import requests
import hashlib
from sqlalchemy import create_engine
from sqlalchemy import or_, not_, and_
from sqlalchemy.orm import sessionmaker
from urllib import quote_plus as urlquote
from py_log.logger import Logger
from config.config import Config
from db_orm import *


class Defer(object):
    def __init__(self, fn, args=None):
        self.fn = fn
        self.args = args

    def __enter__(self):
        pass

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.args:
            self.fn(self.args)
        else:
            self.fn()


class DbError(object):
    OK = 0
    RELY_EXIST_ERROR = 1
    DB_OPERATE_ERROR = 2


class MonitorDetail(object):
    def __init__(self):
        self.base_info = None
        self.healthy_check_list = list()
        self.unhealthy_check_list = list()
        self.rely_service_list = list()


class DbOperator(object):
    engine = None

    @classmethod
    def init(cls):
        try:
            server_db_uri = 'mysql+mysqldb://%s:%s@%s:%s/%s?charset=utf8' \
                            % (Config.DB_USER, urlquote(Config.DB_PWD), Config.DB_HOST, Config.DB_PORT, Config.DB_NAME)
            cls.engine = create_engine(server_db_uri, echo=False, pool_recycle=3600, pool_size=10)
            return True
        except:
            Logger.error(traceback.format_exc())

    # 增加用户
    @classmethod
    def add_one_user(cls, user_name, user_email, user_pwd, user_right):
        try:
            m = hashlib.md5()
            m.update(user_pwd)
            pwd_md5 = m.hexdigest()
            user = Users(user_name=user_name, user_email=user_email, user_pwd=pwd_md5, user_right=user_right)
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.add(user)
                session.flush()
                session.commit()

                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'insert into db error'
            return json.dumps(a_dict)

    # 查询用户
    @classmethod
    def query_user_list(cls, user_name, off_set, limit):
        try:
            # 转换类型
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(Users.id)
                value_query = session.query(Users.id,
                                            Users.user_name,
                                            Users.user_email,
                                            Users.user_right,
                                            Users.create_time)
                if user_name != '':
                    like_condition = '%' + user_name + '%'
                    count_query = count_query.filter(Users.user_name.like(like_condition))
                    value_query = value_query.filter(Users.user_name.like(like_condition))
                count = count_query.count()
                values = value_query.order_by(Users.id.desc())[off_set: limit_count]

                # 返回结果
                a_user_list = list()
                for value in values:
                    a_user = dict()
                    a_user_list.append(a_user)
                    a_user['id'] = value.id
                    a_user['user_name'] = value.user_name
                    a_user['user_email'] = value.user_email
                    a_user['user_right'] = value.user_right
                    a_user['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['content'] = a_user_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # 删除用户
    @classmethod
    def delete_users(cls, user_id_list):
        try:
            # 过滤参数
            split_id_list = user_id_list.split(',')
            join_id_list = list()
            for user_id in split_id_list:
                if user_id != '':
                    join_id_list.append(user_id)
            if len(join_id_list) == 0:
                a_dict = dict()
                a_dict['success'] = False
                a_dict['msg'] = list()
                return json.dumps(a_dict)

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Users).filter(Users.id.in_(join_id_list)).delete(synchronize_session=False)
                session.commit()
                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'delete from db error'
            return json.dumps(a_dict)

    # 更新用户信息
    @classmethod
    def edit_user(cls, user_id, user_right):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Users).filter(Users.id == user_id).update({Users.user_right: user_right})
                session.commit()
                db_user_list = session.query(Users.id,
                                             Users.user_email,
                                             Users.user_right,
                                             Users.create_time).filter(Users.id == user_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_user_list) > 0:
                    db_user = db_user_list[0]
                    a_user = {
                        'id': db_user.id,
                        'user_email': db_user.user_email,
                        'user_right': db_user.user_right,
                        'create_time': db_user.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_user)
                    return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict)

    # 获取用户信息
    @classmethod
    def get_user_info(cls, user_email):
        """
        :type user_email: str
        :rtype: Users
        """
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                values = session.query(Users).filter(Users.user_email == user_email)

                user = None
                for value in values:
                    user = value
                    break

                if not user:
                    Logger.error("query user_email[%s] from users get none" % user_email)
                    return None
                return user
        except:
            Logger.error(traceback.format_exc())
            return None

    # 获取监测项状态
    @classmethod
    def __get_monitor_status(cls, job_id_set, service_list):
        """
        :type job_id_set: set[int]
        :param service_list: list[dict[str, Object]]
        :return:
        """
        try:
            if len(job_id_set) <= 0:
                return

            service_id_string = ','.join([str(item) for item in job_id_set])
            request_data = {
                'service_id': service_id_string
            }
            url = Config.MONITOR_URL + '/api_monitor_status'
            r = requests.post(url, data=request_data)
            Logger.info("url=[%s], service_id_list=[%s], status_code=[%s], response=[%s]" % (url, job_id_set, r.status_code, r.text))
            if r.status_code != 200:
                return

            json_dict = json.loads(r.text)
            if json_dict['code'] != 0:
                return

            status_dict = json_dict['content']
            for a_service in service_list:
                result = status_dict.get(str(a_service['id']), None)
                if result is not None:
                    (healthy_code, last) = result
                    a_service['monitor_time'] = datetime.datetime.fromtimestamp(last).strftime('%Y-%m-%d %H:%M:%S')
                    a_service['healthy_code'] = healthy_code
        except:
            Logger.error(traceback.format_exc())

    # 获取监测列表
    @classmethod
    def query_monitor_list(cls, service_name, off_set, limit):
        try:
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(Services.id).join(
                    Machines, Machines.id == Services.machine_id)
                value_query = session.query(Services.id,
                                            Services.user_email,
                                            Services.service_name,
                                            Services.machine_id,
                                            Machines.ssh_user,
                                            Machines.ssh_ip,
                                            Machines.ssh_port,
                                            Services.start_cmd,
                                            Services.stop_cmd,
                                            Services.restart_cmd,
                                            Services.is_active,
                                            Services.auto_recover,
                                            Services.mail_receiver,
                                            Services.create_time).join(
                    Machines, Machines.id == Services.machine_id)
                if service_name != '':
                    like_condition = '%' + service_name + '%'
                    count_query = count_query.filter(Services.service_name.like(like_condition))
                    value_query = value_query.filter(Services.service_name.like(like_condition))

                count = count_query.count()
                values = value_query[off_set: limit_count]
                # 返回结果
                job_id_set = set()
                service_list = list()
                for value in values:
                    job_id_set.add(value.id)
                    a_service = dict()
                    service_list.append(a_service)
                    a_service['id'] = value.id
                    a_service['user_email'] = value.user_email
                    a_service['service_name'] = value.service_name
                    a_service['machine_id'] = value.machine_id
                    a_service['ssh_user'] = value.ssh_user
                    a_service['ssh_ip'] = value.ssh_ip
                    a_service['ssh_port'] = value.ssh_port
                    a_service['start_cmd'] = value.start_cmd
                    a_service['stop_cmd'] = value.stop_cmd
                    a_service['restart_cmd'] = value.restart_cmd
                    a_service['is_active'] = value.is_active
                    a_service['auto_recover'] = value.auto_recover
                    a_service['mail_receiver'] = value.mail_receiver
                    a_service['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    a_service['monitor_time'] = '1970-01-01 00:00:00'
                    a_service['healthy_code'] = 0

                # 获取最新监测状态
                cls.__get_monitor_status(job_id_set, service_list)

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['content'] = service_list
                a_dict['item_count'] = count
                return json.dumps(a_dict, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict, ensure_ascii=False)

    # 获取监测列表
    @classmethod
    def query_all_monitor_base(cls, service_name, off_set, limit):
        try:
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                value_query = session.query(Services.id, Services.service_name)
                if service_name != '':
                    like_condition = '%' + service_name + '%'
                    value_query = value_query.filter(Services.service_name.like(like_condition))

                values = value_query[off_set: limit_count]
                # 返回结果
                service_list = list()
                for value in values:
                    a_service = dict()
                    service_list.append(a_service)
                    a_service['id'] = value.id
                    a_service['service_name'] = value.service_name

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['content'] = service_list
                return json.dumps(a_dict, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = list()
            return json.dumps(a_dict, ensure_ascii=False)

    # 获取监测列表
    @classmethod
    def query_all_monitor_base_v2(cls, service_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                values = session.query(Services.id, Services.service_name).filter(
                    Services.id != service_id)[:]
                # 返回结果
                return values
        except:
            Logger.error(traceback.format_exc())
            return None

    # Get all operator
    @classmethod
    def query_all_operator(cls):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                values = session.query(Operator.operator)[:]
                content = list()
                for value in values:
                    item = dict()
                    content.append(item)
                    item['operator'] = value.operator
                result = dict()
                result['success'] = True
                result['content'] = content
                return json.dumps(result, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = list()
            return json.dumps(a_dict, ensure_ascii=False)

    @classmethod
    def insert_monitor_detail(cls, user_email, monitor_detail):
        try:
            detail = json.loads(monitor_detail)
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # Query service name
                count = session.query(Services).filter(Services.service_name == detail['service_name']).count()
                if count > 0:
                    result = dict()
                    result['success'] = False
                    result['msg'] = '服务名称已存在'
                    return json.dumps(result, ensure_ascii=False)

                # insert base info
                monitor = Services()
                monitor.user_email = user_email
                monitor.service_name = detail['service_name']
                monitor.machine_id = detail['machine_id']
                monitor.start_cmd = detail['start_cmd']
                monitor.stop_cmd = detail['stop_cmd']
                monitor.restart_cmd = detail['restart_cmd']
                monitor.is_active = detail['is_active']
                monitor.auto_recover = detail['auto_recover']
                monitor.mail_receiver = detail['mail_receiver']
                session.add(monitor)
                session.flush()

                # insert check cmd
                request_cmd_list = detail['check_cmd_list']
                if request_cmd_list:
                    check_cmd_list = list()
                    for check_cmd in request_cmd_list:
                        checker = CheckCmd()
                        check_cmd_list.append(checker)
                        checker.service_id = monitor.id
                        checker.local_check = check_cmd['local_check']
                        checker.check_shell = check_cmd['check_shell']
                        checker.operator = check_cmd['operator']
                        checker.check_value = check_cmd['check_value']
                        checker.good_match = check_cmd['good_match']
                    session.bulk_save_objects(check_cmd_list)
                    session.flush()

                # insert rely services
                request_rely_list = detail['rely_service_list']
                if request_rely_list:
                    rely_list = list()
                    for rely_id in request_rely_list:
                        service_rely = ServiceRely()
                        rely_list.append(service_rely)
                        service_rely.service_id = monitor.id
                        service_rely.rely_id = rely_id
                    session.bulk_save_objects(rely_list)
                    session.flush()

                # active monitor
                if detail['is_active']:
                    session.query(Services).filter(Services.id == monitor.id).update(
                        {Services.is_active: detail['is_active']})
                    session.flush()
                session.commit()

                result = dict()
                result['success'] = True
                result['msg'] = 'OK'
                return json.dumps(result, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            result = dict()
            result['success'] = False
            result['msg'] = 'internal error'
            return json.dumps(result, ensure_ascii=False)

    # 查询监测详情
    @classmethod
    def query_monitor_detail(cls, service_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                values = session.query(Services.id,
                                       Services.user_email,
                                       Services.service_name,
                                       Services.machine_id,
                                       Machines.ssh_user,
                                       Machines.ssh_ip,
                                       Machines.ssh_port,
                                       Services.start_cmd,
                                       Services.stop_cmd,
                                       Services.restart_cmd,
                                       Services.is_active,
                                       Services.auto_recover,
                                       Services.mail_receiver,
                                       Services.create_time).join(
                    Machines, Machines.id == Services.machine_id).filter(
                    Services.id == service_id)[:]
                if len(values) == 0:
                    return None

                monitor_detail = MonitorDetail()
                # Set monitor base information
                monitor_detail.base_info = values[0]
                # query check_cmd_list
                values = session.query(CheckCmd.id,
                                       CheckCmd.local_check,
                                       CheckCmd.check_shell,
                                       CheckCmd.operator,
                                       CheckCmd.check_value,
                                       CheckCmd.good_match).filter(CheckCmd.service_id == service_id)[:]
                for value in values:
                    if value.good_match == 1:
                        # healthy_check_list.append(check_cmd)
                        monitor_detail.healthy_check_list.append(value)
                    else:
                        # unhealthy_check_list.append(check_cmd)
                        monitor_detail.unhealthy_check_list.append(value)

                # query rely services
                values = session.query(Services.id,
                                       Services.service_name).join(
                    ServiceRely, Services.id == ServiceRely.rely_id).filter(
                    ServiceRely.service_id == service_id)[:]
                for value in values:
                    monitor_detail.rely_service_list.append(value)
                return monitor_detail
        except:
            Logger.error(traceback.format_exc())
            return None

    # 切换监测激活状态
    @classmethod
    def set_monitor_active(cls, service_id, expect_active):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Services).filter(Services.id == service_id).update({Services.is_active: expect_active})
                session.commit()
                values = session.query(Services.id,
                                       Services.user_email,
                                       Services.service_name,
                                       Services.machine_id,
                                       Machines.ssh_user,
                                       Machines.ssh_ip,
                                       Machines.ssh_port,
                                       Services.start_cmd,
                                       Services.stop_cmd,
                                       Services.restart_cmd,
                                       Services.is_active,
                                       Services.auto_recover,
                                       Services.mail_receiver,
                                       Services.create_time).join(
                    Machines, Machines.id == Services.machine_id).filter(
                    Services.id == service_id)[:]
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(values) == 0:
                    return json.dumps(a_dict, ensure_ascii=False)
                else:
                    value = values[0]
                    a_service = dict()
                    content.append(a_service)
                    a_service['id'] = value.id
                    a_service['user_email'] = value.user_email
                    a_service['service_name'] = value.service_name
                    a_service['machine_id'] = value.machine_id
                    a_service['ssh_user'] = value.ssh_user
                    a_service['ssh_ip'] = value.ssh_ip
                    a_service['ssh_port'] = value.ssh_port
                    a_service['start_cmd'] = value.start_cmd
                    a_service['stop_cmd'] = value.stop_cmd
                    a_service['restart_cmd'] = value.restart_cmd
                    a_service['is_active'] = value.is_active
                    a_service['auto_recover'] = value.auto_recover
                    a_service['mail_receiver'] = value.mail_receiver
                    a_service['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    a_service['healthy_code'] = 0
                    a_service['monitor_time'] = '1970-01-01 00:00:00'

                    # 获取最新监测状态
                    cls.__get_monitor_status(set(service_id), [a_service])
                    return json.dumps(a_dict, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = None
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict, ensure_ascii=False)

    # 编辑monitor_detail
    @classmethod
    def edit_monitor_detail(cls, user_email, service_id, monitor_detail):
        try:
            detail = json.loads(monitor_detail)
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # query and update info
                monitor = session.query(Services).filter(Services.id == service_id).one()
                monitor.user_email = user_email
                monitor.service_name = detail['service_name']
                monitor.machine_id = detail['machine_id']
                monitor.start_cmd = detail['start_cmd']
                monitor.stop_cmd = detail['stop_cmd']
                monitor.restart_cmd = detail['restart_cmd']
                monitor.is_active = detail['is_active']
                monitor.auto_recover = detail['auto_recover']
                monitor.mail_receiver = detail['mail_receiver']
                session.flush()

                # delete old check cmd
                session.query(CheckCmd).filter(CheckCmd.service_id == service_id).delete(synchronize_session=False)
                session.flush()

                # insert new check cmd
                request_cmd_list = detail['check_cmd_list']
                if request_cmd_list:
                    check_cmd_list = list()
                    for check_cmd in request_cmd_list:
                        checker = CheckCmd()
                        check_cmd_list.append(checker)
                        checker.service_id = monitor.id
                        checker.local_check = check_cmd['local_check']
                        checker.check_shell = check_cmd['check_shell']
                        checker.operator = check_cmd['operator']
                        checker.check_value = check_cmd['check_value']
                        checker.good_match = check_cmd['good_match']
                    session.bulk_save_objects(check_cmd_list)

                # delete old rely services
                session.query(ServiceRely).filter(ServiceRely.service_id == service_id).delete(
                    synchronize_session=False)
                session.flush()

                # insert rely services
                request_rely_list = detail['rely_service_list']
                if request_rely_list:
                    rely_list = list()
                    for rely_id in request_rely_list:
                        service_rely = ServiceRely()
                        rely_list.append(service_rely)
                        service_rely.service_id = monitor.id
                        service_rely.rely_id = rely_id
                    session.bulk_save_objects(rely_list)
                    session.flush()

                # commit
                session.commit()

                result = dict()
                result['success'] = True
                return json.dumps(result, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            result = dict()
            result['success'] = False
            return json.dumps(result, ensure_ascii=False)

    # 删除监测
    @classmethod
    def delete_monitor_detail(cls, service_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # check weather it can be deleted
                count = session.query(ServiceRely).filter(ServiceRely.rely_id == service_id).count()
                if count > 0:
                    result = dict()
                    result['success'] = False
                    result['code'] = DbError.RELY_EXIST_ERROR
                    return json.dumps(result, ensure_ascii=False)

                # delete from services
                session.query(Services).filter(Services.id == service_id).delete(synchronize_session=False)
                # delete from check cmd
                session.query(CheckCmd).filter(CheckCmd.service_id == service_id).delete(synchronize_session=False)
                # delete from rely
                session.query(ServiceRely).filter(ServiceRely.service_id == service_id).delete(
                    synchronize_session=False)
                session.commit()

                result = dict()
                result['success'] = True
                result['code'] = DbError.OK
                return json.dumps(result, ensure_ascii=False)
        except:
            Logger.error(traceback.format_exc())
            result = dict()
            result['success'] = False
            result['code'] = DbError.DB_OPERATE_ERROR
            return json.dumps(result, ensure_ascii=False)

    # Query machine list
    @classmethod
    def query_machine_list(cls, machine, off_set, limit):
        try:
            # 转换类型
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(Machines.id)
                value_query = session.query(
                    Machines.id,
                    Machines.ssh_user,
                    Machines.ssh_ip,
                    Machines.ssh_port,
                    Machines.create_time)
                if machine != '':
                    machine_condition = '%' + machine + '%'
                    count_query = count_query.filter(or_(
                        Machines.ssh_user.like(machine_condition),
                        Machines.ssh_ip.like(machine_condition)))
                    value_query = value_query.filter(or_(
                        Machines.ssh_user.like(machine_condition),
                        Machines.ssh_ip.like(machine_condition)))
                count = count_query.count()
                values = value_query[off_set: limit_count]

                # 返回结果
                a_machine_list = list()
                for value in values:
                    a_machine = dict()
                    a_machine_list.append(a_machine)
                    a_machine['id'] = value.id
                    a_machine['ssh_user'] = value.ssh_user
                    a_machine['ssh_ip'] = value.ssh_ip
                    a_machine['ssh_port'] = value.ssh_port
                    a_machine['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S')

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['content'] = a_machine_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    # Query all machine list
    @classmethod
    def query_machine_list_v2(cls):
        try:
            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                value_query = session.query(
                    Machines.id,
                    Machines.ssh_user,
                    Machines.ssh_ip,
                    Machines.ssh_port)
                values = value_query[:]

                # 返回结果
                a_machine_list = list()
                for value in values:
                    a_machine_list.append(value)
                return a_machine_list
        except:
            Logger.error(traceback.format_exc())
            return None

    # Add one machine
    @classmethod
    def add_one_machine(cls, ssh_user, ssh_ip, ssh_port):
        try:
            machine = Machines(ssh_user=ssh_user, ssh_ip=ssh_ip, ssh_port=ssh_port)
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.add(machine)
                session.flush()
                session.commit()

                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'insert into db error'
            return json.dumps(a_dict)

    # Edit one machine
    @classmethod
    def edit_machine(cls, machine_id, ssh_user, ssh_ip, ssh_port):
        try:
            a_dict = dict()
            if not machine_id or not ssh_user or not ssh_ip or not ssh_port:
                a_dict['success'] = False
                a_dict['msg'] = 'data invalid'
                return json.dumps(a_dict)

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Machines).filter(Machines.id == machine_id).update(
                    {Machines.ssh_user: ssh_user,
                     Machines.ssh_ip: ssh_ip,
                     Machines.ssh_port: ssh_port})
                session.commit()
                db_machine_list = session.query(
                    Machines.id,
                    Machines.ssh_user,
                    Machines.ssh_ip,
                    Machines.ssh_port,
                    Machines.create_time).filter(
                    Machines.id == machine_id)[:]
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                a_dict['content'] = content = list()
                if len(db_machine_list) > 0:
                    db_machine = db_machine_list[0]
                    a_machine = {
                        'id': db_machine.id,
                        'ssh_user': db_machine.ssh_user,
                        'ssh_ip': db_machine.ssh_ip,
                        'ssh_port': db_machine.ssh_port,
                        'create_time': db_machine.create_time.strftime('%Y-%m-%d %H:%M:%S')
                    }
                    content.append(a_machine)
                    return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'update db failed'
            return json.dumps(a_dict)

    # Delete machines
    @classmethod
    def delete_machines(cls, machine_id_list):
        try:
            # 过滤参数
            split_id_list = machine_id_list.split(',')
            join_id_list = list()
            for user_id in split_id_list:
                if user_id != '':
                    join_id_list.append(user_id)
            if len(join_id_list) == 0:
                a_dict = dict()
                a_dict['success'] = False
                a_dict['msg'] = list()
                return json.dumps(a_dict)

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                session.query(Machines).filter(Machines.id.in_(join_id_list)).delete(synchronize_session=False)
                session.commit()
                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['msg'] = 'delete from db error'
            return json.dumps(a_dict)

    # Delete one machine
    @classmethod
    def delete_one_machine(cls, machine_id):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                using_count = session.query(Services).filter(Services.machine_id == machine_id).count()
                if using_count > 0:
                    result = dict()
                    result['success'] = False
                    result['code'] = DbError.RELY_EXIST_ERROR
                    return json.dumps(result, ensure_ascii=False)
                session.query(Machines).filter(Machines.id == machine_id).delete(synchronize_session=False)
                session.commit()
                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['code'] = DbError.OK
                a_dict['msg'] = 'ok'
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['code'] = DbError.DB_OPERATE_ERROR
            a_dict['msg'] = 'delete from db error'
            return json.dumps(a_dict)

            # Query machine list

    @classmethod
    def query_start_history(cls, user_email, off_set, limit, start_time, end_time):
        try:
            # 转换类型
            off_set = int(off_set)
            limit = int(limit)
            if limit == -1:
                limit_count = None
            else:
                limit_count = off_set + limit

            # Get start_date and end_date
            start_date = datetime.datetime.fromtimestamp(start_time)
            end_date = datetime.datetime.fromtimestamp(end_time)

            # 创建session
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # 查询数据
                count_query = session.query(StartHistory.id).filter(
                    and_(StartHistory.create_time >= start_date,
                         StartHistory.create_time <= end_date))
                value_query = session.query(
                    StartHistory.id,
                    StartHistory.user_email,
                    StartHistory.service_name,
                    StartHistory.ssh_user,
                    StartHistory.ssh_ip,
                    StartHistory.execute_cmd,
                    StartHistory.create_time,
                    StartHistory.start_time,
                    StartHistory.end_time,
                    StartHistory.stdout,
                    StartHistory.stderr).filter(
                    and_(StartHistory.create_time >= start_date,
                         StartHistory.create_time <= end_date))
                if user_email != '':
                    machine_condition = '%' + user_email + '%'
                    count_query = count_query.filter(or_(
                        StartHistory.user_email.like(machine_condition)))
                    value_query = value_query.filter(or_(
                        StartHistory.user_email.like(machine_condition)))
                count = count_query.count()
                values = value_query.order_by(StartHistory.id.desc())[off_set: limit_count]

                # 返回结果
                a_history_list = list()
                for value in values:
                    a_history = dict()
                    a_history_list.append(a_history)
                    a_history['id'] = value.id
                    a_history['user_email'] = value.user_email
                    a_history['service_name'] = value.service_name
                    a_history['ssh_user'] = value.ssh_user
                    a_history['ssh_ip'] = value.ssh_ip
                    a_history['execute_cmd'] = value.execute_cmd
                    a_history['stdout'] = value.stdout
                    a_history['stderr'] = value.stderr
                    a_history['create_time'] = value.create_time.strftime('%Y-%m-%d %H:%M:%S') if value.create_time else None
                    a_history['start_time'] = value.start_time.strftime('%Y-%m-%d %H:%M:%S') if value.start_time else None
                    a_history['end_time'] = value.end_time.strftime('%Y-%m-%d %H:%M:%S') if value.end_time else None

                # 返回成功
                a_dict = dict()
                a_dict['success'] = True
                a_dict['content'] = a_history_list
                a_dict['item_count'] = count
                return json.dumps(a_dict)
        except:
            Logger.error(traceback.format_exc())
            a_dict = dict()
            a_dict['success'] = False
            a_dict['content'] = list()
            a_dict['item_count'] = 0
            return json.dumps(a_dict)

    @classmethod
    def change_user_name(cls, user_email, user_name):
        """
        :rtype: tuple[int, str]
        """
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                # query and update info
                user = session.query(Users).filter(Users.user_email == user_email).one()
                user.user_name = user_name

                # commit
                session.commit()
                return 0
        except:
            Logger.error(traceback.format_exc())
            return None

    @classmethod
    def get_user_count(cls, user_name):
        try:
            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                count = session.query(Users).filter(Users.user_name == user_name).count()
                return count
        except:
            Logger.error(traceback.format_exc())
            return None

    @classmethod
    def change_user_pwd(cls, user_email, old_pwd, new_pwd):
        try:
            m = hashlib.md5()
            m.update(old_pwd)
            old_md5 = m.hexdigest()
            m = hashlib.md5()
            m.update(new_pwd)
            new_md5 = m.hexdigest()

            session = sessionmaker(bind=cls.engine)()
            with Defer(session.close):
                user = session.query(Users).filter(Users.user_email == user_email).first()
                if not user:
                    Logger.info("There is no user_email[%s]" % user_email)
                    return False, 'User not exist'
                if old_md5 != user.user_pwd:
                    return False, 'Old password is error'
                user.user_pwd = new_md5
                session.commit()
            return 0, 'OK'
        except:
            Logger.error(traceback.format_exc())
            return -1, 'Internal error'
