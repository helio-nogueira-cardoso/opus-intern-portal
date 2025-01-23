package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.GenericMessage;
import br.com.opusinternportal.api.dto.JwtResponse;
import br.com.opusinternportal.api.dto.LoginRequest;
import br.com.opusinternportal.api.dto.RegisterRequest;
import br.com.opusinternportal.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<GenericMessage> register(@Valid @RequestBody RegisterRequest registerRequest) {
        GenericMessage message = authService.register(registerRequest);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
}
