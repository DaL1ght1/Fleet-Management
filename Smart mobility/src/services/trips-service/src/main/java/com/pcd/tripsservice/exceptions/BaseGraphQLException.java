package com.pcd.tripsservice.exceptions;

import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.language.SourceLocation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Base GraphQL exception class with extensions support
 */
public abstract class BaseGraphQLException extends RuntimeException implements GraphQLError {

    private final String code;
    private final String details;
    private final Map<String, Object> extensions;

    protected BaseGraphQLException(String message, String code) {
        this(message, code, null);
    }

    protected BaseGraphQLException(String message, String code, String details) {
        super(message);
        this.code = code;
        this.details = details;
        this.extensions = new HashMap<>();
        this.extensions.put("code", code);
        if (details != null && !details.isEmpty()) {
            this.extensions.put("details", details);
        }
    }

    protected BaseGraphQLException(String message, String code, String details, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.details = details;
        this.extensions = new HashMap<>();
        this.extensions.put("code", code);
        if (details != null && !details.isEmpty()) {
            this.extensions.put("details", details);
        }
    }

    @Override
    public List<SourceLocation> getLocations() {
        return null;
    }

    @Override
    public ErrorType getErrorType() {
        return ErrorType.DataFetchingException;
    }

    @Override
    public Map<String, Object> getExtensions() {
        return extensions;
    }

    public String getCode() {
        return code;
    }

    public String getDetails() {
        return details;
    }

    protected void addExtension(String key, Object value) {
        this.extensions.put(key, value);
    }

    protected void addExtensions(Map<String, Object> additionalExtensions) {
        this.extensions.putAll(additionalExtensions);
    }
}
