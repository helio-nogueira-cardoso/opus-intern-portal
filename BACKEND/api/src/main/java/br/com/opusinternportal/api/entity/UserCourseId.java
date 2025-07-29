package br.com.opusinternportal.api.entity;

import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserCourseId implements Serializable {
    private PortalUser user;
    private UUID course;
}
