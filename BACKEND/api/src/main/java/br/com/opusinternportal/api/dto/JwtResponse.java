package br.com.opusinternportal.api.dto;

import br.com.opusinternportal.api.entity.Role;

import java.util.UUID;

public record JwtResponse(
        String token,
        UUID id,
        Role role
) {
}
