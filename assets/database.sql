use kiro;

CREATE TABLE account (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  profile_image VARCHAR(255) NULL,
  role          ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  wallet_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE game_category (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE game (
  id            CHAR(36) PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  category_id   INT NOT NULL,
  image_url     VARCHAR(255) NOT NULL,
  description   TEXT NOT NULL,
  release_date  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_game_category FOREIGN KEY (category_id) REFERENCES game_category(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE cart_item (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  game_id     CHAR(36) NOT NULL,
  added_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE(user_id, game_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES account(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_game FOREIGN KEY (game_id) REFERENCES game(id)
    ON DELETE CASCADE
);

CREATE TABLE discount_code (
  id             CHAR(36) PRIMARY KEY,
  code           VARCHAR(50) NOT NULL UNIQUE,
  description    VARCHAR(255) NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_usage      INT NOT NULL,
  used_count     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE discount_usage (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  discount_id  CHAR(36) NOT NULL,
  user_id      CHAR(36) NOT NULL,
  used_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_usage_discount FOREIGN KEY (discount_id) REFERENCES discount_code(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES account(id)
    ON DELETE CASCADE,
  UNIQUE(discount_id, user_id)
);

CREATE TABLE purchase (
  id             CHAR(36) PRIMARY KEY,
  user_id        CHAR(36) NOT NULL,
  discount_id    CHAR(36) NULL,
  total_price    DECIMAL(10,2) NOT NULL,
  final_price    DECIMAL(10,2) NOT NULL,
  purchased_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_purchase_user FOREIGN KEY (user_id) REFERENCES account(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_purchase_discount FOREIGN KEY (discount_id) REFERENCES discount_code(id)
    ON DELETE SET NULL
);

CREATE TABLE purchase_item (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  purchase_id CHAR(36) NOT NULL,
  game_id     CHAR(36) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_pitem_purchase FOREIGN KEY (purchase_id) REFERENCES purchase(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_pitem_game FOREIGN KEY (game_id) REFERENCES game(id)
    ON DELETE CASCADE,
  UNIQUE(purchase_id, game_id)
);

CREATE TABLE user_game (
  id       BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id  CHAR(36) NOT NULL,
  game_id  CHAR(36) NOT NULL,
  owned_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_ug_user FOREIGN KEY (user_id) REFERENCES account(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ug_game FOREIGN KEY (game_id) REFERENCES game(id)
    ON DELETE CASCADE,
  UNIQUE(user_id, game_id)
);

CREATE TABLE transaction_history (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     CHAR(36) NOT NULL,
  type        ENUM('TOPUP','PURCHASE') NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  reference_id CHAR(36) NULL,
  created_at  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES account(id)
    ON DELETE CASCADE
);

CREATE TABLE admin_activity_log (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  admin_id      CHAR(36) NOT NULL,
  action_type   ENUM(
                   'ADD_GAME',
                   'UPDATE_GAME',
                   'DELETE_GAME',
                   'ADD_DISCOUNT',
                   'UPDATE_DISCOUNT',
                   'DELETE_DISCOUNT',
                   'OTHER'
                 ) NOT NULL,
  target_id     CHAR(36) NULL,
  target_table  VARCHAR(50) NULL,
  description   TEXT NULL,
  created_at    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  CONSTRAINT fk_admin_log_admin FOREIGN KEY (admin_id) REFERENCES account(id)
    ON DELETE CASCADE
);
