package com.pcd.maintenanceservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WorkOrderTest {

    private static final LocalDate TODAY = LocalDate.of(2030, 3, 10);
    private static final Instant NOW = Instant.parse("2030-03-10T09:00:00Z");

    private final WorkOrder order = WorkOrder.schedule(new WorkOrder.Plan(UUID.randomUUID(), WorkOrderKind.REPAIR,
            WorkOrderPriority.HIGH, "  Brake pads ", null, "Garage Ennasr", TODAY), false);

    @Test
    void workOrdersMoveThroughTheirLifecycle() {
        order.start(NOW);
        order.complete(NOW.plusSeconds(3600), new BigDecimal("180.50"), new BigDecimal("60"), 15200L, "Replaced");

        assertThat(order.getStatus()).isEqualTo(WorkOrderStatus.COMPLETED);
        assertThat(order.getTitle()).isEqualTo("Brake pads");
        assertThat(order.totalCost()).isEqualByComparingTo("240.50");
    }

    @Test
    void onlyScheduledOrdersCanBeStarted() {
        order.cancel("Vehicle sold");

        assertThatThrownBy(() -> order.start(NOW)).isInstanceOf(BusinessRuleViolationException.class);
    }

    @Test
    void scheduledOrdersInThePastAreOverdueAndNotifiedOnce() {
        assertThat(order.isOverdue(TODAY)).isFalse();
        assertThat(order.isOverdue(TODAY.plusDays(1))).isTrue();
        assertThat(order.markOverdueNotified(NOW)).isTrue();
        assertThat(order.markOverdueNotified(NOW)).isFalse();
    }

    @Test
    void negativeCostsAreRejected() {
        order.start(NOW);

        assertThatThrownBy(() -> order.complete(NOW, new BigDecimal("-1"), null, null, null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
