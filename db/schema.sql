-- ============================================================
-- FXMIRROR - MySQL schema
-- Run this once on your Windows server:
--   mysql -u root -p < db/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS fxmirror
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fxmirror;

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  referral_code   VARCHAR(20)  NOT NULL UNIQUE,
  referred_by     VARCHAR(36)  NULL,
  role            ENUM('user','admin') NOT NULL DEFAULT 'user',
  trial_ends_at   DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_referred_by (referred_by)
) ENGINE=InnoDB;

-- ---------- Sessions (server-side, cookie holds only the id) ----------
CREATE TABLE IF NOT EXISTS sessions (
  id          VARCHAR(64) NOT NULL PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  expires_at  DATETIME    NOT NULL,
  created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id)
) ENGINE=InnoDB;

-- ---------- MT5 accounts (one connected account per user) ----------
-- password_enc holds the AES-256-GCM encrypted MT5 password.
-- live_* columns are written by the Python engine, read by the web app.
CREATE TABLE IF NOT EXISTS mt5_accounts (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id         VARCHAR(36)  NOT NULL UNIQUE,
  login           VARCHAR(32)  NOT NULL,
  server          VARCHAR(120) NOT NULL,
  password_enc    TEXT         NOT NULL,
  is_demo         TINYINT(1)   NOT NULL DEFAULT 1,
  -- status lifecycle: pending (saved, not yet verified by engine),
  -- connected (engine logged in OK), error (login failed), disabled
  status          ENUM('pending','connected','error','disabled') NOT NULL DEFAULT 'pending',
  status_message  VARCHAR(255) NULL,
  -- live data filled by the Python engine
  broker          VARCHAR(120) NULL,
  account_type    VARCHAR(60)  NULL,
  leverage        INT          NULL,
  currency        VARCHAR(10)  NULL DEFAULT 'USD',
  balance         DECIMAL(18,2) NOT NULL DEFAULT 0,
  equity          DECIMAL(18,2) NOT NULL DEFAULT 0,
  free_margin     DECIMAL(18,2) NOT NULL DEFAULT 0,
  daily_profit    DECIMAL(18,2) NOT NULL DEFAULT 0,
  copy_enabled    TINYINT(1)   NOT NULL DEFAULT 1,
  last_sync_at    DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mt5_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_mt5_status (status)
) ENGINE=InnoDB;

-- ---------- Bot sessions (24h cycle per user) ----------
CREATE TABLE IF NOT EXISTS bot_sessions (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  user_id         VARCHAR(36)  NOT NULL,
  -- state: running | payment_due | closed
  state           ENUM('running','payment_due','closed') NOT NULL DEFAULT 'running',
  start_balance   DECIMAL(18,2) NOT NULL DEFAULT 0,
  end_balance     DECIMAL(18,2) NULL,
  profit          DECIMAL(18,2) NOT NULL DEFAULT 0,
  amount_due      DECIMAL(18,2) NOT NULL DEFAULT 0,
  cycle_ends_at   DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bot_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_bot_user_state (user_id, state)
) ENGINE=InnoDB;

-- ---------- Copied trades (written by the Python copier) ----------
CREATE TABLE IF NOT EXISTS copied_trades (
  id                  BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id             VARCHAR(36)  NOT NULL,
  master_ticket       BIGINT       NOT NULL,
  slave_ticket        BIGINT       NULL,
  symbol              VARCHAR(40)  NOT NULL,
  side                ENUM('BUY','SELL') NOT NULL,
  volume              DECIMAL(12,2) NOT NULL,
  open_price          DECIMAL(18,5) NULL,
  close_price         DECIMAL(18,5) NULL,
  profit              DECIMAL(18,2) NULL,
  status              ENUM('open','closed','failed') NOT NULL DEFAULT 'open',
  opened_at           DATETIME     NULL,
  closed_at           DATETIME     NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trade_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_trade (user_id, master_ticket),
  INDEX idx_trade_user (user_id)
) ENGINE=InnoDB;

-- ---------- App settings (single global master config flag, etc.) ----------
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key   VARCHAR(60)  NOT NULL PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
