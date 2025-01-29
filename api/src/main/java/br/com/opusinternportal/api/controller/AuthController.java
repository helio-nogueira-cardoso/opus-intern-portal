package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.GenericMessage;
import br.com.opusinternportal.api.dto.JwtResponse;
import br.com.opusinternportal.api.dto.LoginRequest;
import br.com.opusinternportal.api.dto.RegisterRequest;
import br.com.opusinternportal.api.service.AuthService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<GenericMessage> register(@Valid @RequestBody RegisterRequest registerRequest) {
        GenericMessage message = authService.register(registerRequest);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/confirm/{id}")
    public ResponseEntity<GenericMessage> confirm(@PathVariable("id") UUID id) {
        GenericMessage message = authService.confirm(id);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
}
