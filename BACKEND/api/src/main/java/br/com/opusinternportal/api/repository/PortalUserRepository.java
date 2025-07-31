package br.com.opusinternportal.api.repository;

import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PortalUserRepository extends JpaRepository<PortalUser, UUID> {
    Optional<PortalUser> findByEmail(String email);
    List<PortalUser> findByRole(Role role);
}
