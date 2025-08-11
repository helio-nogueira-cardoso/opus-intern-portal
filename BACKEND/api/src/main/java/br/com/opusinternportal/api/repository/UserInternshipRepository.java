package br.com.opusinternportal.api.repository;

import br.com.opusinternportal.api.entity.UserInternship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserInternshipRepository extends JpaRepository<UserInternship, UUID> {
    List<UserInternship> findByUserId(UUID userId);
    void deleteByUserIdAndInternshipId(UUID userId, UUID internshipId);
}
