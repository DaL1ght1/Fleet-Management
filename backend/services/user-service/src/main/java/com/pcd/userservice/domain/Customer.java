package com.pcd.userservice.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer {

    @Id
    private UUID id;

    @Version
    private long version;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private UUID accountId;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public static Customer register(CustomerDetails details) {
        Customer customer = new Customer();
        customer.id = UUID.randomUUID();
        customer.apply(details);
        return customer;
    }

    public static Customer forAccount(UUID accountId, CustomerDetails details) {
        Customer customer = register(details);
        customer.accountId = accountId;
        return customer;
    }

    public void linkAccount(UUID linkedAccountId) {
        accountId = linkedAccountId;
    }

    public CustomerDetails details() {
        return new CustomerDetails(firstName, lastName, email, phoneNumber);
    }

    public void update(CustomerDetails details) {
        apply(details);
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    private void apply(CustomerDetails details) {
        firstName = details.firstName();
        lastName = details.lastName();
        email = details.email();
        phoneNumber = details.phoneNumber();
    }
}
