package br.com.opusinternportal.api.dto;

import br.com.opusinternportal.api.entity.Internship;

import java.time.LocalDate;
import java.util.UUID;

public record InternshipDTO(
        UUID id,
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        UUID mentorId
) {
    public static InternshipDTO fromEntity(Internship internship) {
        return new InternshipDTO(
                internship.getId(),
                internship.getTitle(),
                internship.getDescription(),
                internship.getStartDate(),
                internship.getEndDate(),
                internship.getMentor() != null ? internship.getMentor().getId() : null
        );
    }
}
