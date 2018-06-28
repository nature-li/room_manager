#!/usr/bin/env python2.7
# coding: utf-8

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, BigInteger, Float, TIMESTAMP, UniqueConstraint, Date
from sqlalchemy.sql import func

Base = declarative_base()


# Users
class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_name = Column(String(128))
    user_email = Column(String(128))
    user_pwd = Column(String(128))
    user_right = Column(Integer)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('user_name')
    UniqueConstraint('user_email')


# Rooms
class Rooms(Base):
    __tablename__ = 'rooms'
    id = Column(Integer, primary_key=True, autoincrement=True)
    room_name = Column(String(128))
    room_pwd_date = Column(Date)
    room_pwd = Column(String(128))
    rooter_name = Column(String(128))
    rooter_pwd = Column(String(128))
    wifi_name = Column(String(128))
    wifi_pwd = Column(String(128))
    electric_date = Column(Date)
    electric_fee = Column(Float)
    water_date = Column(Date)
    water_fee = Column(Float)
    gas_date = Column(Date)
    gas_fee = Column(Float)
    net_date = Column(Date)
    net_fee = Column(Float)
    desc = Column(String(4096))
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


# Relates
class Relates(Base):
    __tablename__ = 'relates'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer)
    room_id = Column(Integer)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('user_id', 'room_id')


# Sales
class Sales(Base):
    __tablename__ = 'sales'
    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer)
    plat_id = Column(Integer)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('room_id', 'plat_id')


# States
class States(Base):
    __tablename__ = 'states'
    id = Column(Integer, primary_key=True, autoincrement=True)
    room_id = Column(Integer)
    plat_id = Column(Integer)
    day = Column(Date)
    state = Column(Integer)
    create_time = Column(TIMESTAMP, default=func.now())
    UniqueConstraint('room_id', 'plat_id', 'day')



