package br.com.opusinternportal.api.dto;

import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import java.time.LocalDateTime;
import java.util.UUID;

public record PortalUserDTO (
    UUID id,
    String email,
    LocalDateTime createdAt,
    Role role
) {
    public static PortalUserDTO fromEntity(PortalUser user) {
        return new PortalUserDTO(
            user.getId(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getRole()
        );
    }
}
