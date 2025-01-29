package br.com.opusinternportal.api.repository;

import br.com.opusinternportal.api.entity.TempRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TempRegistrationRepository extends JpaRepository<TempRegistration, UUID> {
}
