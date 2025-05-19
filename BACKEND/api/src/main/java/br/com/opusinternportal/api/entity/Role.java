package br.com.opusinternportal.api.entity;

import jakarta.validation.constraints.NotNull;

public enum Role {
    INTERN, MENTOR, ADMIN;

    public static boolean isAdmin(@NotNull(message = "Role must not be null") Role role) {
        return role.equals(ADMIN);
    }
}
