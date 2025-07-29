package br.com.opusinternportal.api.repository;

import br.com.opusinternportal.api.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
}
