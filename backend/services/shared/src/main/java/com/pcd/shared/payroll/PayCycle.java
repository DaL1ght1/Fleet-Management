package com.pcd.shared.payroll;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.LongStream;

public final class PayCycle {

    public static final int DAYS = 30;

    private PayCycle() {
    }

    public static LocalDate nextPayday(LocalDate hireDate, LocalDate today) {
        if (hireDate == null) {
            return null;
        }
        long elapsed = Math.max(0, ChronoUnit.DAYS.between(hireDate, today));
        long cycles = Math.max(1, (elapsed + DAYS - 1) / DAYS);
        return hireDate.plusDays(cycles * DAYS);
    }

    public static List<LocalDate> paydaysBetween(LocalDate hireDate, LocalDate fromExclusive, LocalDate toInclusive) {
        if (hireDate == null || !toInclusive.isAfter(fromExclusive)) {
            return List.of();
        }
        long first = Math.max(1, ChronoUnit.DAYS.between(hireDate, fromExclusive) / DAYS + 1);
        long last = ChronoUnit.DAYS.between(hireDate, toInclusive) / DAYS;
        return LongStream.rangeClosed(first, last).mapToObj(cycle -> hireDate.plusDays(cycle * DAYS)).toList();
    }
}
