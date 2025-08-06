package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.GenericMessage;
import br.com.opusinternportal.api.dto.InternshipDTO;
import br.com.opusinternportal.api.entity.Course;
import br.com.opusinternportal.api.entity.Internship;
import br.com.opusinternportal.api.service.InternshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/internship")
@RequiredArgsConstructor
public class InternshipController {
    @Autowired
    private InternshipService internshipService;

    @PostMapping
    public ResponseEntity<GenericMessage> addInternship(@RequestBody InternshipDTO internshipDTO) {
        UUID savedUUID = internshipService.addInternship(internshipDTO);
        return ResponseEntity.ok(new GenericMessage("" + savedUUID));
    }

    @GetMapping
    public List<InternshipDTO> listAll() {
        return internshipService.listAllInternships()
                .stream()
                .map(InternshipDTO::fromEntity)
                .toList();
    }

    @DeleteMapping("/{internshipId}")
    public ResponseEntity<Void> deleteInternship(@PathVariable UUID internshipId) {
        internshipService.deleteInternship(internshipId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{internshipId}/course/{courseId}")
    public ResponseEntity<Void> addCourseToInternship(@PathVariable UUID internshipId, @PathVariable UUID courseId) {
        internshipService.addCourseToInternship(internshipId, courseId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{internshipId}/course/{courseId}")
    public ResponseEntity<Void> removeCourseFromInternship(@PathVariable UUID internshipId, @PathVariable UUID courseId) {
        internshipService.removeCourseFromInternship(internshipId, courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{internshipId}/courses")
    public List<Course> getCoursesByInternship(@PathVariable UUID internshipId) {
        return internshipService.getCoursesByInternshipId(internshipId);
    }

    @GetMapping("/mentor/{mentorId}")
    public List<InternshipDTO> getInternshipsByMentor(@PathVariable UUID mentorId) {
        return internshipService.getInternshipsByMentorId(mentorId)
                .stream()
                .map(InternshipDTO::fromEntity)
                .toList();
    }
}
