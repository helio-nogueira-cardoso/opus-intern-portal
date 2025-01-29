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

    @Autowired
    private TempRegistrationRepository tempRegistrationRepository;

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

        TempRegistration tempRegistration = TempRegistration.builder()
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .role(registerRequest.role())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();


        tempRegistrationRepository.save(tempRegistration);

        String id = tempRegistration.getId().toString();

        return new GenericMessage(id);
    }

    @Transactional
    public GenericMessage confirm(UUID id) {
        TempRegistration tempRegistration = tempRegistrationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid registration ID!"));

        if (tempRegistration.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Registration has expired!");
        }

        PortalUser portalUser = PortalUser.builder()
                .email(tempRegistration.getEmail())
                .password(tempRegistration.getPassword())
                .role(tempRegistration.getRole())
                .build();

        portalUserRepository.save(portalUser);

        return new GenericMessage("Registration confirmed!");
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
