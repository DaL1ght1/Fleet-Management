package com.pcd.tripsservice.api;

import com.pcd.tripsservice.api.graphql.types.CompleteTripInput;
import com.pcd.tripsservice.api.graphql.types.Customer;
import com.pcd.tripsservice.api.graphql.types.Driver;
import com.pcd.tripsservice.api.graphql.types.LocationInput;
import com.pcd.tripsservice.api.graphql.types.ScheduleTripInput;
import com.pcd.tripsservice.api.graphql.types.TripRequestInput;
import com.pcd.tripsservice.api.graphql.types.TripCostsInput;
import com.pcd.tripsservice.api.graphql.types.TripFilter;
import com.pcd.tripsservice.api.graphql.types.TripPage;
import com.pcd.tripsservice.api.graphql.types.UpdateTripPlanInput;
import com.pcd.tripsservice.api.graphql.types.Vehicle;
import com.pcd.tripsservice.application.TripCompletion;
import com.pcd.tripsservice.application.TripCriteria;
import com.pcd.tripsservice.application.TripPlanChanges;
import com.pcd.tripsservice.application.TripQuote;
import com.pcd.tripsservice.application.TripRequest;
import com.pcd.tripsservice.application.TripStatistics;
import com.pcd.tripsservice.domain.Location;
import com.pcd.tripsservice.domain.Trip;
import com.pcd.tripsservice.domain.TripCosts;
import com.pcd.tripsservice.domain.TripPlan;
import com.pcd.tripsservice.domain.TripStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Mapper
public interface TripGraphQlMapper {

    @Mapping(target = "vehicle", source = "vehicleId")
    @Mapping(target = "driver", source = "driverId")
    @Mapping(target = "customer", source = "customerId")
    @Mapping(target = "actualDurationMinutes", expression = "java(trip.actualDurationMinutes().orElse(null))")
    com.pcd.tripsservice.api.graphql.types.Trip toGraphQl(Trip trip);

    com.pcd.tripsservice.api.graphql.types.Location toGraphQl(Location location);

    @Mapping(target = "totalCost", expression = "java(costs.total())")
    com.pcd.tripsservice.api.graphql.types.TripCosts toGraphQl(TripCosts costs);

    default TripPage toGraphQl(Page<Trip> page) {
        return TripPage.newBuilder()
                .items(page.getContent().stream().map(this::toGraphQl).toList())
                .totalCount(Math.toIntExact(page.getTotalElements()))
                .page(page.getNumber())
                .size(page.getSize())
                .hasNext(page.hasNext())
                .build();
    }

    default com.pcd.tripsservice.api.graphql.types.TripStatistics toGraphQl(TripStatistics statistics) {
        return com.pcd.tripsservice.api.graphql.types.TripStatistics.newBuilder()
                .total(Math.toIntExact(statistics.total()))
                .scheduled(Math.toIntExact(statistics.count(TripStatus.SCHEDULED)))
                .inProgress(Math.toIntExact(statistics.count(TripStatus.IN_PROGRESS)))
                .completed(Math.toIntExact(statistics.count(TripStatus.COMPLETED)))
                .cancelled(Math.toIntExact(statistics.count(TripStatus.CANCELLED)))
                .totalDistanceKm(statistics.totalDistanceKm())
                .totalRevenue(statistics.totalRevenue())
                .build();
    }

    TripPlan toPlan(ScheduleTripInput input);

    TripRequest toRequest(TripRequestInput input);

    com.pcd.tripsservice.api.graphql.types.TripQuote toGraphQl(TripQuote quote);

    TripPlanChanges toChanges(UpdateTripPlanInput input);

    TripCriteria toCriteria(TripFilter filter);

    TripCompletion toCompletion(CompleteTripInput input);

    Location toDomain(LocationInput input);

    TripCosts toDomain(TripCostsInput input);

    default Vehicle toVehicleReference(UUID id) {
        return id == null ? null : Vehicle.newBuilder().id(id).build();
    }

    default Customer toCustomerReference(UUID id) {
        return id == null ? null : Customer.newBuilder().id(id).build();
    }

    default Driver toDriverReference(UUID id) {
        return id == null ? null : Driver.newBuilder().id(id).build();
    }

    default OffsetDateTime toOffsetDateTime(Instant instant) {
        return instant == null ? null : instant.atOffset(ZoneOffset.UTC);
    }

    default Instant toInstant(OffsetDateTime dateTime) {
        return dateTime == null ? null : dateTime.toInstant();
    }
}
