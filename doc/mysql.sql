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