package com.pcd.identityservice.web;

import com.pcd.identityservice.application.AccountService;
import com.pcd.identityservice.web.AuthDtos.AccountResponse;
import com.pcd.identityservice.web.AuthDtos.ChangePasswordRequest;
import com.pcd.identityservice.web.AuthDtos.InvitationRequest;
import com.pcd.identityservice.web.AuthDtos.UpdateProfileRequest;
import com.pcd.shared.security.ManagerOrAdmin;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accounts;

    @GetMapping("/me")
    public AccountResponse me(@AuthenticationPrincipal Jwt jwt) {
        return AccountResponse.of(accounts.profile(accountId(jwt)));
    }

    @PutMapping("/me")
    public AccountResponse updateMe(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateProfileRequest request) {
        return AccountResponse.of(accounts.updateProfile(accountId(jwt), request.email(), request.firstName(),
                request.lastName()));
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal Jwt jwt, @RequestBody ChangePasswordRequest request) {
        accounts.changePassword(accountId(jwt), request.currentPassword(), request.newPassword());
    }

    @PostMapping("/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    @ManagerOrAdmin
    public AccountResponse invite(@RequestBody InvitationRequest request) {
        return AccountResponse.of(accounts.invite(request.email(), request.firstName(), request.lastName(),
                request.role()));
    }

    private static UUID accountId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
