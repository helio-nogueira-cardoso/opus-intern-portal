package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.PortalUserDTO;
import br.com.opusinternportal.api.entity.Role;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
