package br.com.opusinternportal.api.dto;

import br.com.opusinternportal.api.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
        @Email
        String email,

        @NotBlank(message = "Password must not be blank")
        String password,

        @NotNull(message = "Role must not be null")
        Role role
) {

}

