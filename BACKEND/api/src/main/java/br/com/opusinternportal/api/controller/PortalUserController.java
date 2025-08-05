package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.PortalUserDTO;
import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal-user")
public class PortalUserController {
    @Autowired
    PortalUserRepository portalUserRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<PortalUserDTO> getPortalUser() {
        return portalUserRepository.findAll()
                .stream().map(PortalUserDTO::fromEntity).toList();
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR')")
    @GetMapping("/interns")
    public List<PortalUserDTO> getInterns() {
        return portalUserRepository.findByRole(Role.INTERN)
                .stream().map(PortalUserDTO::fromEntity).toList();
    }

    @PostMapping("/intern/{internId}/mentor/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MENTOR')")
    public void assignMentorToIntern(UUID internId, UUID userId) {
        PortalUser intern = portalUserRepository.findById(internId)
                .orElseThrow(() -> new IllegalArgumentException("Intern not found with id: " + internId));
        PortalUser mentor = portalUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Mentor not found with id: " + userId));
        if (mentor.getRole() != Role.MENTOR) {
            throw new IllegalArgumentException("User is not a mentor!");

        }
    }
}