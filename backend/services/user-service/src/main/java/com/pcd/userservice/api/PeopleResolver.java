package com.pcd.userservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.shared.security.AdminOnly;
import com.pcd.shared.security.CurrentAccount;
import com.pcd.shared.security.ManagerOrAdmin;
import com.pcd.shared.security.Staff;
import com.pcd.userservice.api.graphql.types.Customer;
import com.pcd.userservice.api.graphql.types.CustomerInput;
import com.pcd.userservice.api.graphql.types.CustomerPage;
import com.pcd.userservice.api.graphql.types.Driver;
import com.pcd.userservice.api.graphql.types.DriverFilter;
import com.pcd.userservice.api.graphql.types.DriverPage;
import com.pcd.userservice.api.graphql.types.DriverStatistics;
import com.pcd.userservice.api.graphql.types.DriverStatus;
import com.pcd.userservice.api.graphql.types.RegisterDriverInput;
import com.pcd.userservice.api.graphql.types.UpdateCustomerInput;
import com.pcd.userservice.api.graphql.types.UpdateDriverInput;
import com.pcd.userservice.application.CustomerService;
import com.pcd.userservice.application.DriverCriteria;
import com.pcd.userservice.application.DriverService;
import lombok.RequiredArgsConstructor;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class PeopleResolver {

    private final CustomerService customerService;
    private final DriverService driverService;
    private final PeopleGraphQlMapper mapper;
    private final Clock clock;

    @DgsQuery
    @ManagerOrAdmin
    public Customer customer(@InputArgument UUID id) {
        return customerService.find(id).map(mapper::toGraphQl).orElse(null);
    }

    @DgsQuery
    @ManagerOrAdmin
    public CustomerPage customers(@InputArgument String search, @InputArgument Integer page,
                                  @InputArgument Integer size) {
        return mapper.toCustomerPage(customerService.search(search, page, size));
    }

    @DgsQuery
    @Staff
    public Driver driver(@InputArgument UUID id) {
        return driverService.find(id).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @Staff
    public DriverPage drivers(@InputArgument DriverFilter filter, @InputArgument Integer page,
                              @InputArgument Integer size) {
        DriverCriteria criteria = filter == null ? DriverCriteria.ANY : mapper.toCriteria(filter);
        return mapper.toDriverPage(driverService.search(criteria, page, size), today());
    }

    @DgsQuery
    @ManagerOrAdmin
    public DriverStatistics driverStatistics() {
        return mapper.toGraphQl(driverService.statistics());
    }

    @DgsQuery
    @Staff
    public Driver myDriverProfile() {
        return CurrentAccount.id().flatMap(driverService::findByAccount).map(this::toGraphQl).orElse(null);
    }

    @DgsMutation
    @ManagerOrAdmin
    public Customer registerCustomer(@InputArgument CustomerInput input) {
        return mapper.toGraphQl(customerService.register(mapper.toDetails(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Customer updateCustomer(@InputArgument UUID id, @InputArgument UpdateCustomerInput input) {
        return mapper.toGraphQl(customerService.update(id, input.getFirstName(), input.getLastName(),
                input.getEmail(), input.getPhoneNumber()));
    }

    @DgsMutation
    @AdminOnly
    public boolean deleteCustomer(@InputArgument UUID id) {
        customerService.delete(id);
        return true;
    }

    @DgsMutation
    @ManagerOrAdmin
    public Driver registerDriver(@InputArgument RegisterDriverInput input) {
        return toGraphQl(driverService.register(mapper.toRegistration(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Driver updateDriver(@InputArgument UUID id, @InputArgument UpdateDriverInput input) {
        return toGraphQl(driverService.update(id, mapper.toChanges(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Driver changeDriverStatus(@InputArgument UUID id, @InputArgument DriverStatus status) {
        return toGraphQl(driverService.changeStatus(id,
                com.pcd.userservice.domain.DriverStatus.valueOf(status.name())));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Driver rateDriver(@InputArgument UUID id, @InputArgument Integer rating) {
        return toGraphQl(driverService.rate(id, rating));
    }

    @DgsMutation
    @AdminOnly
    public boolean deleteDriver(@InputArgument UUID id) {
        driverService.delete(id);
        return true;
    }

    @DgsEntityFetcher(name = "Driver")
    public Driver driverReference(Map<String, Object> representation) {
        return driverService.find(idOf(representation)).map(this::toGraphQl).orElse(null);
    }

    @DgsEntityFetcher(name = "Customer")
    public Customer customerReference(Map<String, Object> representation) {
        return customerService.find(idOf(representation)).map(mapper::toGraphQl).orElse(null);
    }

    private Driver toGraphQl(com.pcd.userservice.domain.Driver driver) {
        return mapper.toGraphQl(driver, today());
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private static UUID idOf(Map<String, Object> representation) {
        return UUID.fromString(String.valueOf(representation.get("id")));
    }
}
