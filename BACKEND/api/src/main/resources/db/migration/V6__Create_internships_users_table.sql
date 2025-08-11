CREATE TABLE internships_users (
    internship_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    PRIMARY KEY (internship_id, user_id)
);