package br.com.opusinternportal.api.service;

import br.com.opusinternportal.api.config.JwtTokenProvider;
import br.com.opusinternportal.api.dto.GenericMessage;
import br.com.opusinternportal.api.dto.JwtResponse;
import br.com.opusinternportal.api.dto.LoginRequest;
import br.com.opusinternportal.api.dto.RegisterRequest;
import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import br.com.opusinternportal.api.entity.TempRegistration;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import br.com.opusinternportal.api.repository.TempRegistrationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PortalUserRepository portalUserRepository;

    @Value("${opusinternportal.email-domain}")
    private String emailDomain;

    @Transactional
    public GenericMessage register(RegisterRequest registerRequest) {
        if (registerRequest.role() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot register as an administrator!");
        }

        if (!registerRequest.email().toLowerCase().endsWith(emailDomain.toLowerCase())) {
            throw new IllegalArgumentException("Email must belong to the domain: " + emailDomain);
        }

        Optional<PortalUser> existingUser = portalUserRepository.findByEmail(registerRequest.email());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        PortalUser newPortalUser = PortalUser.builder()
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .role(registerRequest.role())
                .createdAt(LocalDateTime.now())
                .build();


        portalUserRepository.save(newPortalUser);

        String id = newPortalUser.getId().toString();

        return new GenericMessage(id);
    }

    public JwtResponse login(LoginRequest request) {
        var authenticationToken =  new UsernamePasswordAuthenticationToken(request.email(), request.password());
        var authentication = authenticationManager.authenticate(authenticationToken);
        var jwtToken = jwtTokenProvider.generateToken(
                (PortalUser) authentication.getPrincipal()
        );

        return new JwtResponse(jwtToken);
    }
}
