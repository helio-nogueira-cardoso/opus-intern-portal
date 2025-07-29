package br.com.opusinternportal.api.service;

import br.com.opusinternportal.api.entity.Course;
import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.UserCourse;
import br.com.opusinternportal.api.repository.CourseRepository;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import br.com.opusinternportal.api.repository.UserCourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PortalUserRepository portalUserRepository;

    @Autowired
    private UserCourseRepository userCourseRepository;

    public List<Course> listAllCourses()
    {
        return courseRepository.findAll();
    }

    public void markCourseAsDone(UUID userId, UUID courseId) {
       PortalUser user = portalUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));

        if (!userCourseRepository.existsByUserIdAndCourseId(userId, courseId)) {
            userCourseRepository.save(new UserCourse(user, course));
        }
    }

    public void unmarkCourse(UUID userID, UUID courseId)  {
        if (userCourseRepository.existsByUserIdAndCourseId(userID, courseId)) {
            userCourseRepository.deleteByUserIdAndCourseId(userID, courseId);
        } else {
            throw new IllegalArgumentException("User does not have this course marked as done.");
        }
    }

    public List<Course> getCoursesDoneByUser(UUID userId) {
        return userCourseRepository.findByUserId(userId);
    }
}
