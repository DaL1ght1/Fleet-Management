package com.pcd.shared.payroll;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PayCycleTest {

    private static final LocalDate HIRED = LocalDate.of(2030, 1, 1);

    @Test
    void theNextPaydayIsTheNextThirtyDayMarkAfterHiring() {
        assertThat(PayCycle.nextPayday(HIRED, HIRED)).isEqualTo(LocalDate.of(2030, 1, 31));
        assertThat(PayCycle.nextPayday(HIRED, LocalDate.of(2030, 1, 31))).isEqualTo(LocalDate.of(2030, 1, 31));
        assertThat(PayCycle.nextPayday(HIRED, LocalDate.of(2030, 2, 1))).isEqualTo(LocalDate.of(2030, 3, 2));
    }

    @Test
    void paydaysBetweenTwoDatesFollowTheHiringRhythm() {
        assertThat(PayCycle.paydaysBetween(HIRED, LocalDate.of(2030, 1, 31), LocalDate.of(2030, 4, 15)))
                .containsExactly(LocalDate.of(2030, 3, 2), LocalDate.of(2030, 4, 1));
        assertThat(PayCycle.paydaysBetween(HIRED, LocalDate.of(2029, 12, 1), LocalDate.of(2030, 1, 31)))
                .containsExactly(LocalDate.of(2030, 1, 31));
        assertThat(PayCycle.paydaysBetween(HIRED, LocalDate.of(2030, 2, 1), LocalDate.of(2030, 2, 10))).isEmpty();
    }
}
