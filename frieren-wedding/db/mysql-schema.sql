CREATE TABLE IF NOT EXISTS rsvps (
  id CHAR(36) PRIMARY KEY,
  credential_hash CHAR(64) NOT NULL UNIQUE,
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  guests INT NOT NULL,
  needs_stay TINYINT(1) NOT NULL DEFAULT 0,
  stay_guests INT NOT NULL DEFAULT 0,
  check_in VARCHAR(10) NULL,
  check_out VARCHAR(10) NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  status ENUM('pending','confirmed','none') NOT NULL DEFAULT 'none',
  consent_at VARCHAR(35) NOT NULL,
  created_at VARCHAR(35) NOT NULL,
  updated_at VARCHAR(35) NOT NULL,
  INDEX idx_rsvps_stay_date (needs_stay,check_in)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_limits (
  `key` CHAR(64) PRIMARY KEY,
  `count` INT NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX idx_rate_expiry (expires_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
