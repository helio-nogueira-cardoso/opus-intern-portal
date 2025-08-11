package br.com.opusinternportal.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "user_internships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@IdClass(UserInternshipId.class)
public class UserInternship implements Serializable {
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private PortalUser user;

    @Id
    @ManyToOne
    @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;
}
