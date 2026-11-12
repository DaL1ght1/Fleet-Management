package com.pcd.shared.graphql;

import com.netflix.graphql.types.errors.ErrorType;
import com.netflix.graphql.types.errors.TypedGraphQLError;
import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.error.ConflictException;
import com.pcd.shared.error.NotFoundException;
import graphql.GraphQLError;
import graphql.schema.DataFetchingEnvironment;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.util.Map;
import java.util.stream.Collectors;

public class DomainExceptionResolver extends DataFetcherExceptionResolverAdapter implements Ordered {

    private static final Logger log = LoggerFactory.getLogger(DomainExceptionResolver.class);
    private static final Map<String, Object> CONFLICT = Map.of("reason", "CONFLICT");

    @Override
    protected GraphQLError resolveToSingleError(Throwable exception, DataFetchingEnvironment environment) {
        return builderFor(exception, environment)
                .path(environment.getExecutionStepInfo().getPath())
                .location(environment.getField().getSourceLocation())
                .build();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private TypedGraphQLError.Builder builderFor(Throwable exception, DataFetchingEnvironment environment) {
        return switch (exception) {
            case NotFoundException notFound -> TypedGraphQLError.newNotFoundBuilder().message(notFound.getMessage());
            case ConflictException conflict -> failedPrecondition(conflict.getMessage()).extensions(CONFLICT);
            case OptimisticLockingFailureException stale ->
                    failedPrecondition("The resource was modified concurrently, reload and retry").extensions(CONFLICT);
            case DataIntegrityViolationException integrity ->
                    failedPrecondition("The request conflicts with existing data").extensions(CONFLICT);
            case BusinessRuleViolationException violation -> failedPrecondition(violation.getMessage());
            case ConstraintViolationException invalid -> TypedGraphQLError.newBadRequestBuilder()
                    .message("Invalid input")
                    .extensions(Map.of("violations", violations(invalid)));
            case IllegalArgumentException invalid -> TypedGraphQLError.newBadRequestBuilder().message(invalid.getMessage());
            case NullPointerException missing when missing.getMessage() != null && missing.getMessage().endsWith("is required") ->
                    TypedGraphQLError.newBadRequestBuilder().message(missing.getMessage());
            case AccessDeniedException denied -> TypedGraphQLError.newPermissionDeniedBuilder().message("Access denied");
            case AuthenticationException unauthenticated ->
                    TypedGraphQLError.newBuilder().errorType(ErrorType.UNAUTHENTICATED).message("Authentication required");
            default -> {
                log.error("Unhandled error while resolving {}", environment.getExecutionStepInfo().getPath(), exception);
                yield TypedGraphQLError.newInternalErrorBuilder().message("An internal error occurred");
            }
        };
    }

    private static TypedGraphQLError.Builder failedPrecondition(String message) {
        return TypedGraphQLError.newBuilder().errorType(ErrorType.FAILED_PRECONDITION).message(message);
    }

    private static Map<String, String> violations(ConstraintViolationException exception) {
        return exception.getConstraintViolations().stream().collect(Collectors.toMap(
                violation -> violation.getPropertyPath().toString(),
                ConstraintViolation::getMessage,
                (first, second) -> first + "; " + second));
    }
}
