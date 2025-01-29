package br.com.opusinternportal.api.exception;

import br.com.opusinternportal.api.dto.GenericMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

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

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Void> handleNotFound(NoHandlerFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<GenericMessage> handleMissingParameter(MissingServletRequestParameterException ex) {
        return ResponseEntity
                .badRequest()
                .body(new GenericMessage("Missing parameter: " + ex.getParameterName()));
    }
}
