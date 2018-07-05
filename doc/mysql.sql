DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `user_name`   VARCHAR(128) NOT NULL,
  `user_email`  VARCHAR(128) NOT NULL,
  `user_pwd`    VARCHAR(128) NOT NULL,
  `user_right`  INT          NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_name`),
  UNIQUE KEY `user_email` (`user_email`)
)
  DEFAULT CHARSET = utf8;
INSERT INTO users (user_name, user_email, user_pwd, user_right)
VALUES ('xb', 'lyg@meitu.com', 'e10adc3949ba59abbe56e057f20f883e', 127);


DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id`            INT           NOT NULL AUTO_INCREMENT,
  `room_name`     VARCHAR(128)  NOT NULL,
  `room_pwd_date` DATE          NULL,
  `room_pwd`      VARCHAR(128)  NULL,
  `rooter_name`   VARCHAR(128)  NULL,
  `rooter_pwd`    VARCHAR(128)  NULL,
  `wifi_name`     VARCHAR(128)  NULL,
  `wifi_pwd`      VARCHAR(128)  NULL,
  `electric_date` DATE          NULL,
  `electric_fee`  FLOAT         NULL,
  `water_date`    DATE          NULL,
  `water_fee`     FLOAT         NULL,
  `gas_date`      DATE          NULL,
  `gas_fee`       FLOAT         NULL,
  `net_date`      DATE          NULL,
  `net_fee`       FLOAT         NULL,
  `desc`          VARCHAR(4096) NULL,
  `create_time`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_name` (`room_name`)
)
  DEFAULT CHARSET = utf8;


DROP TABLE IF EXISTS `plats`;
CREATE TABLE IF NOT EXISTS `plats` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `plat_name`   VARCHAR(128) NOT NULL,
  `create_time` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plat_name` (`plat_name`)
)
  DEFAULT CHARSET = utf8;
INSERT INTO plats (id, plat_name) VALUES (1, '爱迎彼'), (2, '途家'), (3, '榛果'), (4, '小猪');


DROP TABLE IF EXISTS `states`;
CREATE TABLE IF NOT EXISTS `states` (
  `id`      INT  NOT NULL AUTO_INCREMENT,
  `room_id` INT  NOT NULL,
  `plat_id` INT  NOT NULL,
  `day`     DATE NOT NULL,
  `state`   INT  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_plat_day` (`room_id`, `plat_id`, `day`)
)
  DEFAULT CHARSET = utf8;


DROP TABLE IF EXISTS `relates`;
CREATE TABLE IF NOT EXISTS `relates` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `user_id`     INT       NOT NULL,
  `room_id`     INT       NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_room_id` (`user_id`, `room_id`)
)
  DEFAULT CHARSET = utf8;


DROP TABLE IF EXISTS `sales`;
CREATE TABLE IF NOT EXISTS `sales` (
  `id`          INT       NOT NULL AUTO_INCREMENT,
  `room_id`     INT       NOT NULL,
  `plat_id`     INT       NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_plat_id` (`room_id`, `plat_id`)
)
  DEFAULT CHARSET = utf8;


DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `room_id`      INT           NOT NULL,
  `plat_id`      INT           NOT NULL,
  `user_name`    VARCHAR(64)   NOT NULL,
  `check_in`     DATE          NOT NULL,
  `check_out`    DATE          NOT NULL,
  `order_fee`    FLOAT         NOT NULL,
  `person_count` INT           NULL,
  `phone`        VARCHAR(32)   NULL,
  `wechat`       VARCHAR(64)   NULL,
  `desc`         VARCHAR(1024) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plat_check` (`room_id`, `check_in`, `check_out`)
)
  DEFAULT CHARSET = utf8;