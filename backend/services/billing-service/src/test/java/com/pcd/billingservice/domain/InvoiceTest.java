package com.pcd.billingservice.domain;

import com.pcd.shared.error.BusinessRuleViolationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvoiceTest {

    private static final LocalDate TODAY = LocalDate.of(2030, 5, 1);

    private final Invoice invoice = Invoice.draft("INV-2030-000001", UUID.randomUUID(), UUID.randomUUID(),
            UUID.randomUUID(), List.of(new InvoiceLine("Rental trip · 120 km", new BigDecimal("200"))),
            new BigDecimal("0.19"));

    @Test
    void draftsComputeTaxAndTotals() {
        assertThat(invoice.getSubtotal()).isEqualByComparingTo("200.000");
        assertThat(invoice.getTaxAmount()).isEqualByComparingTo("38.000");
        assertThat(invoice.getTotal()).isEqualByComparingTo("238.000");
        assertThat(invoice.getStatus()).isEqualTo(InvoiceStatus.DRAFT);
    }

    @Test
    void issuedInvoicesBecomeOverdueAfterTheirDueDate() {
        invoice.issue(TODAY, 30);

        assertThat(invoice.getDueDate()).isEqualTo(TODAY.plusDays(30));
        assertThat(invoice.isOverdue(TODAY.plusDays(30))).isFalse();
        assertThat(invoice.isOverdue(TODAY.plusDays(31))).isTrue();
    }

    @Test
    void onlyIssuedInvoicesCanBePaidAndPaidInvoicesCannotBeVoided() {
        assertThatThrownBy(() -> invoice.markPaid(TODAY, PaymentMethod.CASH))
                .isInstanceOf(BusinessRuleViolationException.class);

        invoice.issue(TODAY, 15);
        invoice.markPaid(TODAY.plusDays(3), PaymentMethod.CARD);

        assertThat(invoice.getPaidOn()).isEqualTo(TODAY.plusDays(3));
        assertThatThrownBy(() -> invoice.voidInvoice("mistake")).isInstanceOf(BusinessRuleViolationException.class);
    }
}
