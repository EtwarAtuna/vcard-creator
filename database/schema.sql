-- Create database
CREATE DATABASE IF NOT EXISTS vcard_creator;
USE vcard_creator;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- vCards table
CREATE TABLE IF NOT EXISTS vcards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    full_name VARCHAR(100) NOT NULL,
    job_title VARCHAR(100),
    company VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    photo_url VARCHAR(255),
    background_color VARCHAR(20) DEFAULT '#ffffff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Company brochure table
CREATE TABLE IF NOT EXISTS company_brochure (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Brochure images table
CREATE TABLE IF NOT EXISTS brochure_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    image_url VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contact interactions table (for tracking vCard views and interactions)
CREATE TABLE IF NOT EXISTS contact_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vcard_id INT,
    interaction_type ENUM('view', 'download', 'share') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vcard_id) REFERENCES vcards(id) ON DELETE CASCADE
);

-- Tags table for categorizing vCards
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- vCard tags relationship table
CREATE TABLE IF NOT EXISTS vcard_tags (
    vcard_id INT,
    tag_id INT,
    PRIMARY KEY (vcard_id, tag_id),
    FOREIGN KEY (vcard_id) REFERENCES vcards(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vcard_id INT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vcard_id) REFERENCES vcards(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_vcards_user_id ON vcards(user_id);
CREATE INDEX idx_vcards_full_name ON vcards(full_name);
CREATE INDEX idx_vcards_email ON vcards(email);
CREATE INDEX idx_contact_interactions_vcard_id ON contact_interactions(vcard_id);
CREATE INDEX idx_vcard_tags_tag_id ON vcard_tags(tag_id);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);

-- Insert some default tags
INSERT INTO tags (name) VALUES 
('Business'),
('Personal'),
('Sales'),
('Marketing'),
('Support'),
('Development'),
('Management');

-- Create a view for vCard statistics
CREATE VIEW vcard_statistics AS
SELECT 
    v.id,
    v.full_name,
    v.email,
    COUNT(DISTINCT CASE WHEN ci.interaction_type = 'view' THEN ci.id END) as view_count,
    COUNT(DISTINCT CASE WHEN ci.interaction_type = 'download' THEN ci.id END) as download_count,
    COUNT(DISTINCT CASE WHEN ci.interaction_type = 'share' THEN ci.id END) as share_count
FROM vcards v
LEFT JOIN contact_interactions ci ON v.id = ci.vcard_id
GROUP BY v.id, v.full_name, v.email;

-- Create a stored procedure for getting vCard details with tags
DELIMITER //
CREATE PROCEDURE get_vcard_with_tags(IN vcard_id INT)
BEGIN
    SELECT 
        v.*,
        GROUP_CONCAT(t.name) as tags
    FROM vcards v
    LEFT JOIN vcard_tags vt ON v.id = vt.vcard_id
    LEFT JOIN tags t ON vt.tag_id = t.id
    WHERE v.id = vcard_id
    GROUP BY v.id;
END //
DELIMITER ;

-- Create a trigger to update the updated_at timestamp
DELIMITER //
CREATE TRIGGER before_vcard_update
    BEFORE UPDATE ON vcards
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;
