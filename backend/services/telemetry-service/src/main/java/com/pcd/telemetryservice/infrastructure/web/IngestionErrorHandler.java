package com.pcd.telemetryservice.infrastructure.web;

import com.pcd.telemetryservice.application.DeviceAuthenticationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = IngestionController.class)
public class IngestionErrorHandler {

    @ExceptionHandler(DeviceAuthenticationException.class)
    ProblemDetail unauthenticated(DeviceAuthenticationException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, exception.getMessage());
    }

    @ExceptionHandler({IllegalArgumentException.class, NullPointerException.class})
    ProblemDetail invalid(RuntimeException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ProblemDetail unreadable(HttpMessageNotReadableException exception) {
        Throwable cause = exception.getMostSpecificCause();
        String detail = cause instanceof IllegalArgumentException || cause instanceof NullPointerException
                ? cause.getMessage()
                : "The request body is not a valid position batch";
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    }
}
