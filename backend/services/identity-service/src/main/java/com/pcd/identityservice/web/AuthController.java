package com.pcd.identityservice.web;

import com.pcd.identityservice.application.AccountService;
import com.pcd.identityservice.infrastructure.keycloak.TokenSet;
import com.pcd.identityservice.web.AuthDtos.CompletePasswordRequest;
import com.pcd.identityservice.web.AuthDtos.ForgotPasswordRequest;
import com.pcd.identityservice.web.AuthDtos.SessionResponse;
import com.pcd.identityservice.web.AuthDtos.SignInRequest;
import com.pcd.identityservice.web.AuthDtos.SignUpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountService accounts;
    private final SessionCookies cookies;

    @PostMapping("/sign-in")
    public ResponseEntity<SessionResponse> signIn(@RequestBody SignInRequest request) {
        return session(accounts.signIn(request.email(), request.password()), HttpStatus.OK);
    }

    @PostMapping("/sign-up")
    public ResponseEntity<SessionResponse> signUp(@RequestBody SignUpRequest request) {
        return session(accounts.signUp(request.email(), request.firstName(), request.lastName(), request.password()),
                HttpStatus.CREATED);
    }

    @PostMapping("/refresh")
    public ResponseEntity<SessionResponse> refresh(
            @CookieValue(name = SessionCookies.REFRESH_COOKIE, required = false) String refreshToken) {
        return session(accounts.refresh(refreshToken), HttpStatus.OK);
    }

    @PostMapping("/sign-out")
    public ResponseEntity<Void> signOut(
            @CookieValue(name = SessionCookies.REFRESH_COOKIE, required = false) String refreshToken) {
        accounts.signOut(refreshToken);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookies.clear().toString()).build();
    }

    @PostMapping("/password/forgot")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void forgotPassword(@RequestBody ForgotPasswordRequest request) {
        accounts.requestPasswordReset(request.email());
    }

    @PostMapping("/password/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@RequestBody CompletePasswordRequest request) {
        accounts.completePasswordToken(request.token(), request.password());
    }

    private ResponseEntity<SessionResponse> session(TokenSet tokens, HttpStatus status) {
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, cookies.issue(tokens).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(SessionResponse.of(tokens));
    }
}
