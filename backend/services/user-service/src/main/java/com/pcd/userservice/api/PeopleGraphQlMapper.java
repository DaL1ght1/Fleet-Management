package com.pcd.userservice.api;

import com.pcd.userservice.api.graphql.types.CustomerInput;
import com.pcd.userservice.api.graphql.types.CustomerPage;
import com.pcd.userservice.api.graphql.types.DriverFilter;
import com.pcd.userservice.api.graphql.types.DriverPage;
import com.pcd.userservice.api.graphql.types.EmergencyContactInput;
import com.pcd.userservice.api.graphql.types.RegisterDriverInput;
import com.pcd.userservice.api.graphql.types.UpdateDriverInput;
import com.pcd.userservice.application.DriverCriteria;
import com.pcd.userservice.application.DriverProfileChanges;
import com.pcd.userservice.application.DriverRegistration;
import com.pcd.userservice.application.DriverStatistics;
import com.pcd.userservice.domain.Customer;
import com.pcd.userservice.domain.CustomerDetails;
import com.pcd.userservice.domain.Driver;
import com.pcd.userservice.domain.DriverStatus;
import com.pcd.userservice.domain.EmergencyContact;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Mapper
public interface PeopleGraphQlMapper {

    com.pcd.userservice.api.graphql.types.Customer toGraphQl(Customer customer);

    @Mapping(target = "available", expression = "java(driver.isAvailable(today))")
    @Mapping(target = "licenseExpired", expression = "java(driver.isLicenseExpired(today))")
    @Mapping(target = "nextPayday",
            expression = "java(com.pcd.shared.payroll.PayCycle.nextPayday(driver.getHireDate(), today))")
    com.pcd.userservice.api.graphql.types.Driver toGraphQl(Driver driver, @Context LocalDate today);

    com.pcd.userservice.api.graphql.types.EmergencyContact toGraphQl(EmergencyContact contact);

    default CustomerPage toCustomerPage(Page<Customer> page) {
        return CustomerPage.newBuilder()
                .items(page.getContent().stream().map(this::toGraphQl).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default DriverPage toDriverPage(Page<Driver> page, LocalDate today) {
        return DriverPage.newBuilder()
                .items(page.getContent().stream().map(driver -> toGraphQl(driver, today)).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default com.pcd.userservice.api.graphql.types.DriverStatistics toGraphQl(DriverStatistics statistics) {
        return com.pcd.userservice.api.graphql.types.DriverStatistics.newBuilder()
                .total(Math.toIntExact(statistics.total()))
                .active(Math.toIntExact(statistics.count(DriverStatus.ACTIVE)))
                .inactive(Math.toIntExact(statistics.count(DriverStatus.INACTIVE)))
                .suspended(Math.toIntExact(statistics.count(DriverStatus.SUSPENDED)))
                .onLeave(Math.toIntExact(statistics.count(DriverStatus.ON_LEAVE)))
                .available(Math.toIntExact(statistics.available()))
                .onTrip(Math.toIntExact(statistics.onTrip()))
                .licensesExpiringSoon(Math.toIntExact(statistics.licensesExpiringSoon()))
                .build();
    }

    CustomerDetails toDetails(CustomerInput input);

    DriverRegistration toRegistration(RegisterDriverInput input);

    DriverProfileChanges toChanges(UpdateDriverInput input);

    DriverCriteria toCriteria(DriverFilter filter);

    EmergencyContact toDomain(EmergencyContactInput input);

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }
}
