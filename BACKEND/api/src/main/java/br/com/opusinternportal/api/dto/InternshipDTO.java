package br.com.opusinternportal.api.dto;

import java.time.LocalDate;
import java.util.UUID;

public record InternshipDTO(
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        UUID mentorId
) {
}
