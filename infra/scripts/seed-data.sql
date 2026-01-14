-- Seed data for testing
-- This script inserts a default admin user for testing purposes

-- Default admin user
-- Email: admin@admin.local
-- Password: admin123
-- The password hash below is BCrypt hash of 'admin123'
INSERT INTO "Users" ("Email", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt")
VALUES
    ('admin@admin.local', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'Admin', NOW())
ON CONFLICT ("Email") DO NOTHING;

-- Test user
-- Email: user@test.com
-- Password: user123
INSERT INTO "Users" ("Email", "PasswordHash", "FirstName", "LastName", "Role", "CreatedAt")
VALUES
    ('user@test.com', '$2a$11$6BKqp9T.vKzIjmXd5s3LseVH0F7bYZwXqEPvV8rBqQxJgd3PqN5HG', 'Test', 'User', 'User', NOW())
ON CONFLICT ("Email") DO NOTHING;
