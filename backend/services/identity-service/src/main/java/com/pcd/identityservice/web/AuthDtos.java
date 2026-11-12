package com.pcd.identityservice.web;

import com.pcd.identityservice.domain.Account;
import com.pcd.identityservice.domain.Role;
import com.pcd.identityservice.infrastructure.keycloak.TokenSet;

import java.util.Set;
import java.util.UUID;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record SignInRequest(String email, String password) {
    }

    public record SignUpRequest(String email, String firstName, String lastName, String password) {
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record CompletePasswordRequest(String token, String password) {
    }

    public record ChangePasswordRequest(String currentPassword, String newPassword) {
    }

    public record UpdateProfileRequest(String email, String firstName, String lastName) {
    }

    public record InvitationRequest(String email, String firstName, String lastName, Role role) {
    }

    public record SessionResponse(String accessToken, long expiresIn) {

        static SessionResponse of(TokenSet tokens) {
            return new SessionResponse(tokens.accessToken(), tokens.expiresIn());
        }
    }

    public record AccountResponse(UUID id, String email, String firstName, String lastName, Set<Role> roles) {

        static AccountResponse of(Account account) {
            return new AccountResponse(account.id(), account.email(), account.firstName(), account.lastName(),
                    account.roles());
        }
    }
}
