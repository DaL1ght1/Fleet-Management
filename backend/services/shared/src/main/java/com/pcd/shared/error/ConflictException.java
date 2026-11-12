package com.pcd.shared.error;

public class ConflictException extends DomainException {

    public ConflictException(String message) {
        super(message);
    }
}
