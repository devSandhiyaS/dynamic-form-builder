
CREATE DATABASE IF NOT EXISTS dynamic_form_builder
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE dynamic_form_builder;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('DRAFT', 'PUBLISHED') DEFAULT 'DRAFT',
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_forms_user
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    INDEX idx_forms_status (status),
    INDEX idx_forms_created_by (created_by)
);

-- Dynamic form fields table
CREATE TABLE IF NOT EXISTS form_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    label VARCHAR(255) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_type ENUM(
        'TEXT',
        'EMAIL',
        'NUMBER',
        'PHONE',
        'TEXTAREA',
        'DATE',
        'SELECT',
        'RADIO',
        'CHECKBOX'
    ) NOT NULL,
    placeholder VARCHAR(255),
    default_value TEXT,
    options JSON,
    validation_rules JSON,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_fields_form
        FOREIGN KEY (form_id)
        REFERENCES forms(id)
        ON DELETE CASCADE,

    UNIQUE KEY unique_form_field_key (form_id, field_key),
    INDEX idx_form_field_order (form_id, display_order)
);

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    form_id INT NOT NULL,
    submitted_data JSON NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submissions_form
        FOREIGN KEY (form_id)
        REFERENCES forms(id)
        ON DELETE CASCADE,

    INDEX idx_submission_form_date (form_id, submitted_at)
);
