USE vcard_creator;

-- Insert sample users
INSERT INTO users (email, password_hash, full_name) VALUES
('admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User'),
('john.doe@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe'),
('jane.smith@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith');

-- Insert sample vCards
INSERT INTO vcards (user_id, full_name, job_title, company, email, phone, address, website, linkedin_url, facebook_url, twitter_url, background_color) VALUES
(1, 'Admin User', 'System Administrator', 'Tech Corp', 'admin@example.com', '+1-555-0123', '123 Admin St, Tech City', 'https://admin.example.com', 'https://linkedin.com/in/admin', 'https://facebook.com/admin', 'https://twitter.com/admin', '#f0f9ff'),
(2, 'John Doe', 'Sales Manager', 'Sales Pro Inc', 'john.doe@example.com', '+1-555-0124', '456 Sales Ave, Business District', 'https://johndoe.example.com', 'https://linkedin.com/in/johndoe', 'https://facebook.com/johndoe', 'https://twitter.com/johndoe', '#f0fdf4'),
(3, 'Jane Smith', 'Marketing Director', 'Marketing Masters', 'jane.smith@example.com', '+1-555-0125', '789 Marketing Blvd, Creative Zone', 'https://janesmith.example.com', 'https://linkedin.com/in/janesmith', 'https://facebook.com/janesmith', 'https://twitter.com/janesmith', '#fdf4ff');

-- Insert company brochure data
INSERT INTO company_brochure (description) VALUES
('Welcome to our company! We are a leading provider of digital business card solutions, helping professionals connect and network effectively in the digital age.');

-- Insert sample brochure images
INSERT INTO brochure_images (image_url, display_order) VALUES
('/uploads/brochure/company-overview.jpg', 1),
('/uploads/brochure/our-team.jpg', 2),
('/uploads/brochure/office-space.jpg', 3);

-- Add tags to vCards
INSERT INTO vcard_tags (vcard_id, tag_id) VALUES
(1, (SELECT id FROM tags WHERE name = 'Management')),
(1, (SELECT id FROM tags WHERE name = 'Development')),
(2, (SELECT id FROM tags WHERE name = 'Sales')),
(2, (SELECT id FROM tags WHERE name = 'Business')),
(3, (SELECT id FROM tags WHERE name = 'Marketing')),
(3, (SELECT id FROM tags WHERE name = 'Business'));

-- Insert sample contact interactions
INSERT INTO contact_interactions (vcard_id, interaction_type, ip_address, user_agent) VALUES
(1, 'view', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'download', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'),
(2, 'view', '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(2, 'share', '192.168.1.103', 'Mozilla/5.0 (Linux; Android 11; Pixel 5)'),
(3, 'view', '192.168.1.104', 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'),
(3, 'download', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Example queries to verify the data

-- Get all vCards with their tags
SELECT 
    v.*,
    GROUP_CONCAT(t.name) as tags
FROM vcards v
LEFT JOIN vcard_tags vt ON v.id = vt.vcard_id
LEFT JOIN tags t ON vt.tag_id = t.id
GROUP BY v.id;

-- Get interaction statistics for each vCard
SELECT * FROM vcard_statistics;

-- Get detailed information for a specific vCard
CALL get_vcard_with_tags(1);
