CREATE TABLE internships_courses (
    internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY (internship_id, course_id)
);