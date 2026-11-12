package com.pcd.identityservice.application;

import com.pcd.identityservice.domain.Account;
import com.pcd.identityservice.domain.PasswordPolicy;
import com.pcd.identityservice.domain.PasswordToken;
import com.pcd.identityservice.domain.Role;
import com.pcd.identityservice.infrastructure.keycloak.InvalidCredentialsException;
import com.pcd.identityservice.infrastructure.keycloak.KeycloakClient;
import com.pcd.identityservice.infrastructure.keycloak.TokenSet;
import com.pcd.identityservice.infrastructure.mail.AccountMailer;
import com.pcd.identityservice.infrastructure.persistence.PasswordTokenRepository;
import com.pcd.shared.error.BusinessRuleViolationException;
import com.pcd.shared.events.AccountEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.messaging.DomainEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private static final Duration TOKEN_RETENTION = Duration.ofDays(7);

    private final KeycloakClient keycloak;
    private final PasswordTokenRepository tokens;
    private final AccountMailer mailer;
    private final DomainEventPublisher events;
    private final IdentityProperties properties;
    private final Clock clock;

    @Transactional
    public TokenSet signIn(String email, String password) {
        if (email == null || password == null) {
            throw new InvalidCredentialsException("Incorrect email or password");
        }
        TokenSet tokens = keycloak.passwordGrant(email.strip().toLowerCase(java.util.Locale.ROOT), password);
        AccessTokenClaims claims = AccessTokenClaims.parse(tokens.accessToken());
        publish(AccountEvent.Type.ACCOUNT_SIGNED_IN, claims.accountId(), claims.email(), claims.firstName(),
                claims.lastName(), claims.primaryRole());
        return tokens;
    }

    public TokenSet refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new InvalidCredentialsException("Your session has ended");
        }
        return keycloak.refreshGrant(refreshToken);
    }

    public void signOut(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            keycloak.logout(refreshToken);
        }
    }

    @Transactional
    public TokenSet signUp(String email, String firstName, String lastName, String password) {
        String normalizedEmail = Account.normalizeEmail(email);
        String first = Account.requireName(firstName, "First name");
        String last = Account.requireName(lastName, "Last name");
        UUID accountId = keycloak.createUser(normalizedEmail, first, last, PasswordPolicy.validate(password));
        keycloak.assignRole(accountId, Role.USER);
        publish(AccountEvent.Type.ACCOUNT_REGISTERED, accountId, normalizedEmail, first, last, Role.USER);
        return keycloak.passwordGrant(normalizedEmail, password);
    }

    @Transactional
    public Account invite(String email, String firstName, String lastName, Role role) {
        if (role == Role.USER || role == null) {
            throw new IllegalArgumentException("Invitations are for staff roles only");
        }
        String normalizedEmail = Account.normalizeEmail(email);
        String first = Account.requireName(firstName, "First name");
        String last = Account.requireName(lastName, "Last name");
        UUID accountId = keycloak.createUser(normalizedEmail, first, last, null);
        keycloak.assignRole(accountId, role);
        PasswordToken.Issued issued = PasswordToken.issue(accountId, PasswordToken.Purpose.INVITATION,
                clock.instant(), properties.invitationTtl());
        tokens.save(issued.token());
        publish(AccountEvent.Type.ACCOUNT_REGISTERED, accountId, normalizedEmail, first, last, role);
        mailer.sendInvitation(normalizedEmail, first, issued.secret());
        return keycloak.get(accountId);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        String normalizedEmail;
        try {
            normalizedEmail = Account.normalizeEmail(email);
        } catch (IllegalArgumentException invalid) {
            return;
        }
        keycloak.findByEmail(normalizedEmail).filter(Account::enabled).ifPresent(account -> {
            PasswordToken.Issued issued = PasswordToken.issue(account.id(), PasswordToken.Purpose.RESET,
                    clock.instant(), properties.resetTokenTtl());
            tokens.save(issued.token());
            mailer.sendPasswordReset(normalizedEmail, account.firstName(), issued.secret());
        });
    }

    @Transactional
    public void completePasswordToken(String secret, String newPassword) {
        PasswordPolicy.validate(newPassword);
        PasswordToken token = tokens.findByTokenHash(PasswordToken.hash(secret == null ? "" : secret))
                .orElseThrow(() -> new BusinessRuleViolationException("This link has expired or was already used"));
        token.redeem(clock.instant());
        keycloak.setPassword(token.getAccountId(), newPassword);
        keycloak.signOutEverywhere(token.getAccountId());
    }

    public Account profile(UUID accountId) {
        return keycloak.get(accountId);
    }

    @Transactional
    public Account updateProfile(UUID accountId, String email, String firstName, String lastName) {
        String normalizedEmail = Account.normalizeEmail(email);
        String first = Account.requireName(firstName, "First name");
        String last = Account.requireName(lastName, "Last name");
        keycloak.update(accountId, normalizedEmail, first, last);
        Account updated = keycloak.get(accountId);
        publish(AccountEvent.Type.ACCOUNT_UPDATED, accountId, normalizedEmail, first, last, primaryRole(updated));
        return updated;
    }

    public void changePassword(UUID accountId, String currentPassword, String newPassword) {
        PasswordPolicy.validate(newPassword);
        Account account = keycloak.get(accountId);
        try {
            keycloak.passwordGrant(account.email(), currentPassword);
        } catch (InvalidCredentialsException wrong) {
            throw new BusinessRuleViolationException("Your current password is incorrect");
        }
        keycloak.setPassword(accountId, newPassword);
    }

    @Transactional
    public int purgeExpiredTokens() {
        return tokens.deleteExpiredBefore(clock.instant().minus(TOKEN_RETENTION));
    }

    private static Role primaryRole(Account account) {
        return account.roles().stream().sorted().findFirst().orElse(Role.USER);
    }

    private void publish(AccountEvent.Type type, UUID accountId, String email, String firstName, String lastName,
                         Role role) {
        events.publish(Topics.ACCOUNT_EVENTS, accountId.toString(), new AccountEvent(UUID.randomUUID(), type,
                clock.instant(), accountId, email, firstName, lastName, role.name()));
    }
}
