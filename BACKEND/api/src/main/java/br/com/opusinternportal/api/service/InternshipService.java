package br.com.opusinternportal.api.service;

import br.com.opusinternportal.api.dto.InternshipDTO;
import br.com.opusinternportal.api.entity.Course;
import br.com.opusinternportal.api.entity.Internship;
import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import br.com.opusinternportal.api.repository.CourseRepository;
import br.com.opusinternportal.api.repository.InternshipRepository;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class InternshipService {
    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private PortalUserRepository portalUserRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<Internship> listAllInternships() {
        return internshipRepository.findAll();
    }

    public UUID addInternship(InternshipDTO internshipDTO) {
        PortalUser mentor = portalUserRepository.findById(internshipDTO.mentorId())
            .orElseThrow(() -> new IllegalArgumentException("Mentor not found with id: " + internshipDTO.mentorId()));

        if (mentor.getRole() != Role.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor!");
        }

        if (internshipDTO.startDate().isAfter(internshipDTO.endDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }

        Internship internship = new Internship();
        internship.setTitle(internshipDTO.title());
        internship.setDescription(internshipDTO.description());
        internship.setStartDate(internshipDTO.startDate());
        internship.setEndDate(internshipDTO.endDate());
        internship.setMentor(mentor);

        Internship savedInternship = internshipRepository.save(internship);

        return savedInternship.getId();
    }

    public void deleteInternship(UUID internshipId) {
        if (!internshipRepository.existsById(internshipId)) {
            throw new IllegalArgumentException("Internship not found with id: " + internshipId);
        }
        internshipRepository.deleteById(internshipId);
    }

    public Internship getInternshipById(UUID internshipId) {
        return internshipRepository.findById(internshipId)
                .orElseThrow(() -> new IllegalArgumentException("Internship not found with id: " + internshipId));
    }

    public void addCourseToInternship(UUID internshipId, UUID courseId) {
        Internship internship = getInternshipById(internshipId);
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("Course not found with id: " + courseId);
        }
        internship.getCourses().add(courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId)));
        internshipRepository.save(internship);
    }

    public void removeCourseFromInternship(UUID internshipId, UUID courseId) {
        Internship internship = getInternshipById(internshipId);
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("Course not found with id: " + courseId);
        }
        internship.getCourses().removeIf(course -> course.getId().equals(courseId));
        internshipRepository.save(internship);
    }

    public List<Course> getCoursesByInternshipId(UUID internshipId) {
        Internship internship = getInternshipById(internshipId);
        return List.copyOf(internship.getCourses());
    }

    public List<Internship> getInternshipsByMentorId(UUID mentorId) {
        PortalUser mentor = portalUserRepository.findById(mentorId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found with id: " + mentorId));
        if (mentor.getRole() != Role.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor!");
        }
        return internshipRepository.findByMentor(mentor);
    }
}
