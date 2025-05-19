package br.com.opusinternportal.api.controller;

import br.com.opusinternportal.api.dto.GenericMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/hello")
    public ResponseEntity<GenericMessage> hello() {
        return ResponseEntity.ok(new GenericMessage("Hello World!"));
    }
}
