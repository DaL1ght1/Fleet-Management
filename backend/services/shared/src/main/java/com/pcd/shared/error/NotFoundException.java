package com.pcd.shared.error;

public class NotFoundException extends DomainException {

    public NotFoundException(String resource, Object id) {
        super("%s %s was not found".formatted(resource, id));
    }
}
