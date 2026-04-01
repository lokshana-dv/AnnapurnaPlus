-- =============================================
-- ANNAPURNA+ Sample Data for Testing
-- Run AFTER schema.sql
-- =============================================

USE annapurna_db;

-- Sample Users (firebase_uid is placeholder — set real one after Firebase signup)
INSERT INTO users (name, email, phone, role, address, latitude, longitude, badge_count) VALUES
('Arjun Sharma',    'arjun@test.com',   '9876543210', 'DONOR',     'Anna Nagar, Chennai',      13.0850, 80.2101, 0),
('Priya Volunteer', 'priya@test.com',   '9876543211', 'VOLUNTEER', 'T Nagar, Chennai',         13.0418, 80.2341, 7),
('Hope NGO',        'hope@test.com',    '9876543212', 'NGO',       'Adyar, Chennai',           13.0012, 80.2565, 0),
('Admin User',      'admin@test.com',   '9000000001', 'ADMIN',     'Salem, Tamil Nadu',        11.6643, 78.1460, 0),
('Rahul Donor',     'rahul@test.com',   '9876543213', 'DONOR',     'Velachery, Chennai',       12.9785, 80.2209, 0),
('Meena Volunteer', 'meena@test.com',   '9876543214', 'VOLUNTEER', 'Porur, Chennai',           13.0357, 80.1571, 12),
('Care Foundation', 'care@test.com',    '9876543215', 'NGO',       'Tambaram, Chennai',        12.9249, 80.1000, 0),
('Suresh Donor',    'suresh@test.com',  '9876543216', 'DONOR',     'Kodambakkam, Chennai',     13.0530, 80.2210, 0);

-- Sample Donations
INSERT INTO donations (donor_id, food_name, food_type, quantity, expiry_time, pickup_address, latitude, longitude, notes, status, priority_score) VALUES
(1, 'Sambar Rice',      'VEG',     40, DATE_ADD(NOW(), INTERVAL 4 HOUR),  'Anna Nagar, Chennai',   13.0850, 80.2101, 'Freshly cooked, packed', 'AVAILABLE', 2.50),
(5, 'Biriyani',         'NON_VEG', 60, DATE_ADD(NOW(), INTERVAL 3 HOUR),  'Velachery, Chennai',    12.9785, 80.2209, 'Event leftovers, still hot', 'AVAILABLE', 3.20),
(8, 'Idli and Chutney', 'VEG',     100,DATE_ADD(NOW(), INTERVAL 6 HOUR),  'Kodambakkam, Chennai',  13.0530, 80.2210, 'Morning breakfast', 'AVAILABLE', 1.80),
(1, 'Biscuit Packets',  'PACKAGED',200,DATE_ADD(NOW(), INTERVAL 48 HOUR), 'Anna Nagar, Chennai',   13.0850, 80.2101, 'Factory sealed packs', 'AVAILABLE', 0.50),
(5, 'Pongal',           'VEG',     30, DATE_ADD(NOW(), INTERVAL 2 HOUR),  'Velachery, Chennai',    12.9785, 80.2209, 'Festival food - very fresh', 'MATCHED',  4.00);

-- Sample Requests
INSERT INTO food_requests (requester_id, number_of_people, food_type_needed, urgency_level, location, latitude, longitude, status) VALUES
(3, 50,  'VEG',    'HIGH',   'Adyar, Chennai',    13.0012, 80.2565, 'PENDING'),
(7, 80,  'ANY',    'MEDIUM', 'Tambaram, Chennai', 12.9249, 80.1000, 'PENDING'),
(3, 30,  'VEG',    'LOW',    'Adyar, Chennai',    13.0012, 80.2565, 'MATCHED'),
(7, 100, 'NON_VEG','HIGH',   'Tambaram, Chennai', 12.9249, 80.1000, 'PENDING');

-- Sample Delivery
INSERT INTO deliveries (donation_id, request_id, volunteer_id, status, accepted_at) VALUES
(5, 3, 2, 'ACCEPTED', NOW());

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(2, '🍱 New Donation Available!', 'Arjun Sharma donated Sambar Rice near your area.', 'NEW_DONATION', FALSE),
(2, '🍱 New Donation Available!', 'Rahul Donor donated Biriyani near your area.', 'NEW_DONATION', FALSE),
(1, '🚴 Volunteer Assigned!', 'Priya Volunteer is picking up your donation.', 'VOLUNTEER_ASSIGNED', FALSE),
(3, '✅ Food Delivered!', 'Your food request has been fulfilled successfully.', 'DELIVERY_SUCCESS', TRUE);

-- Sample Feedback
INSERT INTO feedback (reviewer_id, delivery_id, rating, comment) VALUES
(3, 1, 5, 'Excellent service! Volunteer was very prompt and food was fresh.'),
(7, 1, 4, 'Good delivery, slightly delayed but overall great experience.');

SELECT 'Sample data inserted successfully!' AS Status;
