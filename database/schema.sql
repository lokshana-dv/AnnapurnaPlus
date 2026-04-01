-- =============================================
-- ANNAPURNA+ Database Schema
-- Smart Food Rescue Platform
-- =============================================

CREATE DATABASE IF NOT EXISTS annapurna_db;
USE annapurna_db;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid  VARCHAR(128) UNIQUE,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    role          ENUM('DONOR','VOLUNTEER','NGO','ADMIN') NOT NULL DEFAULT 'DONOR',
    address       VARCHAR(255),
    latitude      DOUBLE,
    longitude     DOUBLE,
    profile_image VARCHAR(500),
    is_active     BOOLEAN DEFAULT TRUE,
    badge_count   INT DEFAULT 0,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- DONATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS donations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id        BIGINT NOT NULL,
    food_name       VARCHAR(150) NOT NULL,
    food_type       ENUM('VEG','NON_VEG','PACKAGED') NOT NULL,
    quantity        INT NOT NULL COMMENT 'Number of servings',
    expiry_time     DATETIME,
    pickup_address  VARCHAR(300),
    latitude        DOUBLE,
    longitude       DOUBLE,
    notes           TEXT,
    image_url       VARCHAR(500),
    status          ENUM('AVAILABLE','MATCHED','PICKUP_PROGRESS','DELIVERED','EXPIRED') DEFAULT 'AVAILABLE',
    priority_score  DOUBLE DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- FOOD REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS food_requests (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id     BIGINT NOT NULL,
    number_of_people INT,
    food_type_needed ENUM('VEG','NON_VEG','ANY') DEFAULT 'ANY',
    urgency_level    ENUM('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM',
    location         VARCHAR(300),
    latitude         DOUBLE,
    longitude        DOUBLE,
    status           ENUM('PENDING','MATCHED','FULFILLED','CANCELLED') DEFAULT 'PENDING',
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- DELIVERIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS deliveries (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id  BIGINT,
    request_id   BIGINT,
    volunteer_id BIGINT,
    status       ENUM('DONATED','ACCEPTED','PICKUP_IN_PROGRESS','DELIVERED') DEFAULT 'DONATED',
    accepted_at  DATETIME,
    pickup_at    DATETIME,
    delivered_at DATETIME,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id)  REFERENCES donations(id)    ON DELETE SET NULL,
    FOREIGN KEY (request_id)   REFERENCES food_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (volunteer_id) REFERENCES users(id)         ON DELETE SET NULL
);

-- =============================================
-- FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    reviewer_id BIGINT,
    delivery_id BIGINT,
    rating      INT CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewer_id) REFERENCES users(id)     ON DELETE SET NULL,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE SET NULL
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT,
    title      VARCHAR(200),
    message    TEXT,
    type       ENUM('NEW_DONATION','VOLUNTEER_ASSIGNED','PICKUP_CONFIRMED','DELIVERY_SUCCESS','GENERAL') DEFAULT 'GENERAL',
    is_read    BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
