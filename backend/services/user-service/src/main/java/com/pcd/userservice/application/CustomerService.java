package com.pcd.userservice.application;

import com.pcd.shared.error.ConflictException;
import com.pcd.shared.error.NotFoundException;
import com.pcd.shared.events.AccountEvent;
import com.pcd.shared.events.CustomerEvent;
import com.pcd.shared.events.Topics;
import com.pcd.shared.messaging.DomainEventPublisher;
import com.pcd.userservice.domain.Customer;
import com.pcd.userservice.domain.CustomerDetails;
import com.pcd.userservice.infrastructure.persistence.CustomerRepository;
import com.pcd.userservice.infrastructure.persistence.PeopleSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final String CUSTOMER_ROLE = "USER";
    private static final Sort DEFAULT_SORT = Sort.by("lastName", "firstName");
    private static final UUID NO_CUSTOMER = new UUID(0, 0);

    private final CustomerRepository customers;
    private final DomainEventPublisher events;
    private final Clock clock;

    @Transactional(readOnly = true)
    public Optional<Customer> find(UUID id) {
        return customers.findById(id);
    }

    @Transactional(readOnly = true)
    public Page<Customer> search(String search, int page, int size) {
        return customers.findAll(PeopleSpecifications.customersMatching(search),
                PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), DEFAULT_SORT));
    }

    public Customer register(CustomerDetails details) {
        ensureEmailAvailable(details.email(), NO_CUSTOMER);
        Customer customer = customers.save(Customer.register(details));
        publish(CustomerEvent.Type.CUSTOMER_REGISTERED, customer);
        return customer;
    }

    public Customer update(UUID id, String firstName, String lastName, String email, String phoneNumber) {
        Customer customer = load(id);
        CustomerDetails details = customer.details().merge(firstName, lastName, email, phoneNumber);
        ensureEmailAvailable(details.email(), id);
        customer.update(details);
        publish(CustomerEvent.Type.CUSTOMER_UPDATED, customer);
        return customer;
    }

    public void delete(UUID id) {
        Customer customer = load(id);
        customers.delete(customer);
        publish(CustomerEvent.Type.CUSTOMER_DELETED, customer);
    }

    public void onAccountEvent(AccountEvent event) {
        if (!CUSTOMER_ROLE.equals(event.role()) || event.email() == null || event.firstName() == null
                || event.lastName() == null) {
            return;
        }
        if (event.type() == AccountEvent.Type.ACCOUNT_SIGNED_IN
                && customers.findByAccountId(event.accountId()).isPresent()) {
            return;
        }
        CustomerDetails details = new CustomerDetails(event.firstName(), event.lastName(), event.email(), null);
        customers.findByAccountId(event.accountId())
                .or(() -> customers.findByEmail(details.email()))
                .ifPresentOrElse(customer -> {
                    customer.linkAccount(event.accountId());
                    customer.update(customer.details().merge(details.firstName(), details.lastName(),
                            details.email(), null));
                    publish(CustomerEvent.Type.CUSTOMER_UPDATED, customer);
                }, () -> publish(CustomerEvent.Type.CUSTOMER_REGISTERED,
                        customers.save(Customer.forAccount(event.accountId(), details))));
    }

    private void ensureEmailAvailable(String email, UUID customerId) {
        if (customers.existsByEmailAndIdNot(email, customerId)) {
            throw new ConflictException("A customer with email %s already exists".formatted(email));
        }
    }

    private Customer load(UUID id) {
        return customers.findById(id).orElseThrow(() -> new NotFoundException("Customer", id));
    }

    private void publish(CustomerEvent.Type type, Customer customer) {
        events.publish(Topics.CUSTOMER_EVENTS, customer.getId().toString(), new CustomerEvent(UUID.randomUUID(), type,
                clock.instant(), customer.getId(), customer.getAccountId(), customer.getFirstName(), customer.getLastName(), customer.getEmail()));
    }
}
