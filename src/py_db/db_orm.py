#!/usr/bin/env python2.7
# coding: utf-8

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, BigInteger, TIMESTAMP, UniqueConstraint
from sqlalchemy.sql import func

Base = declarative_base()


# Users
class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_name = Column(String(128), nullable=True)
    user_pwd = Column(String(128), nullable=True)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint(`user_name`)


# Rooms
class Rooms(Base):
    __tablename__ = 'rooms'
    id = Column(Integer, primary_key=True, autoincrement=True)
    room_name = Column(String(128))
    room_pwd = Column(String(128))
    admin_user = Column(String(128))
    admin_pwd = Column(String(128))
    wifi_name = Column(String(128))
    wifi_pwd = Column(String(128))
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('room_name')


# Plats
class Plats(Base):
    __tablename__ = 'plats'
    id = Column(Integer, primary_key=True, autoincrement=True)
    plat_name = Column(String(128))
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('plat_name')


# State
class Operator(Base):
    __tablename__ = 'state'
    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer)
    plat_id = Column(Integer)
    day = Column(Integer)
    state = Column(Integer)
    UniqueConstraint('room_id', 'plat_id', 'day')


