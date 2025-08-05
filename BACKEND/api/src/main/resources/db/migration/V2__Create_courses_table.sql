CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    description TEXT
);