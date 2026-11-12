package com.pcd.billingservice.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PayrollDriverTest {

    private static final LocalDate TODAY = LocalDate.of(2030, 6, 1);

    @Test
    void aNewlyTrackedDriverIsOwedOnlyTheCurrentCycleNotTheWholeHistory() {
        PayrollDriver driver = PayrollDriver.track(UUID.randomUUID(), TODAY);
        driver.apply(Instant.now(), "Amine Driver", TODAY.minusDays(400), new BigDecimal("1800"), false);

        assertThat(driver.duePaydays(TODAY)).containsExactly(TODAY.minusDays(400).plusDays(390));
    }

    @Test
    void paydaysAccrueEveryThirtyDaysAfterTheCursor() {
        LocalDate hired = TODAY.minusDays(10);
        PayrollDriver driver = PayrollDriver.track(UUID.randomUUID(), TODAY);
        driver.apply(Instant.now(), "Amine Driver", hired, new BigDecimal("1800"), false);

        assertThat(driver.duePaydays(TODAY)).isEmpty();
        assertThat(driver.duePaydays(hired.plusDays(65))).containsExactly(hired.plusDays(30), hired.plusDays(60));

        driver.paidThrough(hired.plusDays(60));
        assertThat(driver.duePaydays(hired.plusDays(65))).isEmpty();
        assertThat(driver.nextPayday(hired.plusDays(65))).contains(hired.plusDays(90));
    }

    @Test
    void driversWithoutASalaryOrDeletedAreNotPaid() {
        PayrollDriver driver = PayrollDriver.track(UUID.randomUUID(), TODAY);
        driver.apply(Instant.now(), "Amine Driver", TODAY.minusDays(90), null, false);
        assertThat(driver.duePaydays(TODAY)).isEmpty();

        driver.apply(Instant.now().plusSeconds(1), "Amine Driver", TODAY.minusDays(90), new BigDecimal("1800"), true);
        assertThat(driver.duePaydays(TODAY)).isEmpty();
        assertThat(driver.nextPayday(TODAY)).isEmpty();
    }
}
