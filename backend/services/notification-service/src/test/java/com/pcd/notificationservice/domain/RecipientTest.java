package com.pcd.notificationservice.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RecipientTest {

    private static final LocalDate TODAY = LocalDate.of(2030, 5, 1);

    @Test
    void driversAreRemindedOncePerLicenseExpiryDate() {
        Recipient driver = Recipient.track(UUID.randomUUID(), Recipient.Kind.DRIVER);
        driver.apply(Instant.now(), UUID.randomUUID(), "Amine Driver", TODAY.plusDays(20), false);

        assertThat(driver.needsLicenseReminder(TODAY, 30)).isTrue();
        driver.licenseReminderSent();
        assertThat(driver.needsLicenseReminder(TODAY, 30)).isFalse();

        driver.apply(Instant.now().plusSeconds(1), null, "Amine Driver", TODAY.plusDays(25), false);
        assertThat(driver.needsLicenseReminder(TODAY, 30)).isTrue();
    }

    @Test
    void staleEventsAndDeletedRecipientsAreIgnored() {
        Recipient customer = Recipient.track(UUID.randomUUID(), Recipient.Kind.CUSTOMER);
        UUID account = UUID.randomUUID();
        Instant now = Instant.now();
        customer.apply(now, account, "Sarra", null, false);
        customer.apply(now.minusSeconds(5), UUID.randomUUID(), "Stale", null, true);

        assertThat(customer.account()).contains(account);
        customer.apply(now.plusSeconds(5), null, "Sarra", null, true);
        assertThat(customer.account()).isEmpty();
    }
}
