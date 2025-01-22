package br.com.opusinternportal.api.service;

import br.com.opusinternportal.api.config.JwtTokenProvider;
import br.com.opusinternportal.api.dto.GenericMessage;
import br.com.opusinternportal.api.dto.JwtResponse;
import br.com.opusinternportal.api.dto.LoginRequest;
import br.com.opusinternportal.api.dto.RegisterRequest;
import br.com.opusinternportal.api.entity.PortalUser;
import br.com.opusinternportal.api.entity.Role;
import br.com.opusinternportal.api.repository.PortalUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private PortalUserRepository portalUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AuthenticationManager authenticationManager;

    public GenericMessage register(RegisterRequest registerRequest) {
        if (registerRequest.role() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot register as an administrator!");
        }

        Optional<PortalUser> existingUser = portalUserRepository.findByEmail(registerRequest.email());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email is already in use!");
        }

        PortalUser portalUser = PortalUser.builder()
                .email(registerRequest.email())
                .password(passwordEncoder.encode(registerRequest.password()))
                .role(Role.valueOf(registerRequest.role().toString().toUpperCase()))
                .build();

        portalUserRepository.save(portalUser);
        return new GenericMessage("User registered successfully!");
    }

    public JwtResponse login(LoginRequest request) {
        var authenticationToken =  new UsernamePasswordAuthenticationToken(request.email(), request.password());
        var authentication = authenticationManager.authenticate(authenticationToken);
        var jwtToken = jwtTokenProvider.generateToken(
                (UserDetails) authentication.getPrincipal()
        );

        return new JwtResponse(jwtToken);
    }
}
