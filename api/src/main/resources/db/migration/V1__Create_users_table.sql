CREATE TABLE USERS (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE USERS
ADD CONSTRAINT chk_role CHECK (role IN ('INTERN', 'MENTOR', 'ADMIN'));
