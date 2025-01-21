package br.com.opusinternportal.api.exception;

import br.com.opusinternportal.api.dto.GenericMessage;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class ErrorHandler {
    public record GenericErrorDTO(String message) {}
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<GenericMessage> handle400Error(HttpMessageNotReadableException ex) {
        return ResponseEntity
                .badRequest()
                .body(new GenericMessage("Malformed request body: please check the format and try again."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<GenericMessage> handle400Error(IllegalArgumentException ex) {
        return ResponseEntity
                .badRequest()
                .body(new GenericMessage(ex.getMessage()));
    }
}
