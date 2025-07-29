package br.com.opusinternportal.api.dto;

import java.util.UUID;

public record JwtResponse(
        String token,
        UUID id
) {
}
