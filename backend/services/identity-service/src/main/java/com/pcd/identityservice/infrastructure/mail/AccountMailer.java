package com.pcd.identityservice.infrastructure.mail;

import com.pcd.identityservice.application.IdentityProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountMailer {

    private final JavaMailSender mailSender;
    private final IdentityProperties properties;

    public void sendPasswordReset(String email, String firstName, String token) {
        send(email, "Reset your SmartStreet password",
                "Hello %s,".formatted(firstName),
                "We received a request to reset your password. The link below is valid for 30 minutes.",
                "Choose a new password", link("/reset-password", token),
                "If you did not ask for this, you can ignore this email.");
    }

    public void sendInvitation(String email, String firstName, String token) {
        send(email, "You're invited to SmartStreet",
                "Welcome %s,".formatted(firstName),
                "An account was created for you on SmartStreet. Choose a password to activate it.",
                "Activate my account", link("/activate", token),
                "The invitation expires in 72 hours.");
    }

    private void send(String to, String subject, String greeting, String body, String action, String url,
                      String footer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(properties.mailFrom());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(plain(greeting, body, url, footer), html(greeting, body, action, url, footer));
            mailSender.send(message);
        } catch (MessagingException | MailException failure) {
            log.error("Could not send '{}' email", subject, failure);
        }
    }

    private String link(String path, String token) {
        return UriComponentsBuilder.fromUriString(properties.frontendUrl()).path(path)
                .queryParam("token", token).build().toUriString();
    }

    private static String plain(String greeting, String body, String url, String footer) {
        return "%s%n%n%s%n%n%s%n%n%s".formatted(greeting, body, url, footer);
    }

    private static String html(String greeting, String body, String action, String url, String footer) {
        return """
                <div style="font-family:Inter,Arial,sans-serif;background:#0b1020;padding:32px">
                  <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:16px;padding:32px">
                    <h2 style="margin:0 0 16px;color:#0b1020">SmartStreet</h2>
                    <p style="color:#1f2937">%s</p>
                    <p style="color:#4b5563">%s</p>
                    <p style="margin:28px 0">
                      <a href="%s" style="background:#4f46e5;color:#ffffff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">%s</a>
                    </p>
                    <p style="color:#9ca3af;font-size:13px">%s</p>
                  </div>
                </div>
                """.formatted(HtmlUtils.htmlEscape(greeting), HtmlUtils.htmlEscape(body), HtmlUtils.htmlEscape(url),
                HtmlUtils.htmlEscape(action), HtmlUtils.htmlEscape(footer));
    }
}
