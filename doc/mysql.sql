DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `user_name`   VARCHAR(128) NULL,
  `user_pwd`    VARCHAR(128) NULL,
  `create_time` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_name`)
)
  DEFAULT CHARSET = utf8;
INSERT INTO users (user_name, user_pwd)
VALUES ('xb', 'e10adc3949ba59abbe56e057f20f883e');

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `room_name`   VARCHAR(128) NOT NULL,
  `room_pwd`    VARCHAR(128) NULL,
  `admin_user`  VARCHAR(128) NULL,
  `admin_pwd`   VARCHAR(128) NULL,
  `wifi_name`   VARCHAR(128) NULL,
  `wifi_pwd`    VARCHAR(128) NULL,
  `create_time` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
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


DROP TABLE IF EXISTS `state`;
CREATE TABLE IF NOT EXISTS `state` (
  `id`      INT NOT NULL AUTO_INCREMENT,
  `room_id` INT NOT NULL,
  `plat_id` INT NOT NULL,
  `day`     INT NOT NULL,
  `state`   INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_plat_day` (`room_id`, `plat_id`, `day`)
)
  DEFAULT CHARSET = utf8;