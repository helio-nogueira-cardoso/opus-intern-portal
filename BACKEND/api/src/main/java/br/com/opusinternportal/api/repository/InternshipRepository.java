package br.com.opusinternportal.api.repository;

import br.com.opusinternportal.api.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InternshipRepository extends JpaRepository<Internship, UUID> {
}
