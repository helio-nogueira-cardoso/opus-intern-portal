package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.entity.Course;
import br.com.opusinternportal.api.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/course")
@RequiredArgsConstructor
public class CourseController {
    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> listAll() {
        return courseService.listAllCourses();
    }

    @PostMapping("/{userId}/{courseId}")
    public ResponseEntity<Void> markDone(@PathVariable UUID userId, @PathVariable UUID courseId) {
        courseService.markCourseAsDone(userId, courseId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/{courseId}")
    public ResponseEntity<Void> unmark(@PathVariable UUID userId, @PathVariable UUID courseId) {
        courseService.unmarkCourse(userId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/done/{userId}")
    public List<Course> getDoneCourses(@PathVariable UUID userId) {
        return courseService.getCoursesDoneByUser(userId);
    }
}
