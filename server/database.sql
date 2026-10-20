CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    VARCHAR(40)  NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profile (
  id                  INT NOT NULL PRIMARY KEY,
  name                TEXT NULL,
  role_line           TEXT NULL,
  university          TEXT NULL,
  university_url      TEXT NULL,
  university_logo_url TEXT NULL,
  intro               TEXT NULL,
  about               TEXT NULL,
  location            TEXT NULL,
  email               TEXT NULL,
  phone               TEXT NULL,
  linkedin            TEXT NULL,
  github              TEXT NULL,
  cv_url              TEXT NULL,
  photo_url           TEXT NULL,
  avatar_url          TEXT NULL,
  status              TEXT NULL,
  show_status         TINYINT(1) NOT NULL DEFAULT 1,
  contact_heading     TEXT NULL,
  sections            LONGTEXT NULL,
  updated_at          VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS experience (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  role        TEXT NULL,
  org         TEXT NULL,
  logo_url    TEXT NULL,
  start_label TEXT NULL,
  end_label   TEXT NULL,
  current     TINYINT(1) NOT NULL DEFAULT 0,
  summary     TEXT NULL,
  tags        LONGTEXT NULL,
  sort        INT NOT NULL DEFAULT 0,
  created_at  VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  title       TEXT NULL,
  tagline     TEXT NULL,
  role        TEXT NULL,
  year        TEXT NULL,
  status      TEXT NULL,
  summary     TEXT NULL,
  highlights  LONGTEXT NULL,
  stack       LONGTEXT NULL,
  images      LONGTEXT NULL,
  link        TEXT NULL,
  repo        TEXT NULL,
  other_links LONGTEXT NULL,
  sort        INT NOT NULL DEFAULT 0,
  created_at  VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificates (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  title       TEXT NULL,
  issuer      TEXT NULL,
  issued      TEXT NULL,
  image_url   TEXT NULL,
  sort        INT NOT NULL DEFAULT 0,
  created_at  VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recognition (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  title       TEXT NULL,
  org         TEXT NULL,
  date_label  TEXT NULL,
  note        TEXT NULL,
  image_url   TEXT NULL,
  sort        INT NOT NULL DEFAULT 0,
  created_at  VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS skills (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  name        TEXT NULL,
  category    TEXT NULL,
  sort        INT NOT NULL DEFAULT 0,
  created_at  VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS education (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  school      TEXT NULL,
  degree      TEXT NULL,
  logo_url    TEXT NULL,
  start_label TEXT NULL,
  end_label   TEXT NULL,
  note        TEXT NULL,
  courses     LONGTEXT NULL,
  sort        INT NOT NULL DEFAULT 0,
  created_at  VARCHAR(40) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
