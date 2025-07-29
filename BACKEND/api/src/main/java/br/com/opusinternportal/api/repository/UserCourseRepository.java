package br.com.opusinternportal.api.repository;

import br.com.opusinternportal.api.entity.Course;
import br.com.opusinternportal.api.entity.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserCourseRepository extends JpaRepository<UserCourse, UUID> {
    List<UserCourse> findByUserId(UUID userId);
    boolean existsByUserIdAndCourseId(UUID userId, UUID courseId);
    void deleteByUserIdAndCourseId(UUID userId, UUID courseId);
}
