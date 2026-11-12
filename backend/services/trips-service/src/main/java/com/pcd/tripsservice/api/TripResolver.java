package com.pcd.tripsservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.shared.security.AdminOnly;
import com.pcd.shared.security.CurrentAccount;
import com.pcd.shared.security.ManagerOrAdmin;
import com.pcd.shared.security.Staff;
import com.pcd.tripsservice.api.graphql.types.CompleteTripInput;
import com.pcd.tripsservice.api.graphql.types.ScheduleTripInput;
import com.pcd.tripsservice.api.graphql.types.Trip;
import com.pcd.tripsservice.api.graphql.types.TripFilter;
import com.pcd.tripsservice.api.graphql.types.TripPage;
import com.pcd.tripsservice.api.graphql.types.TripQuote;
import com.pcd.tripsservice.api.graphql.types.TripRequestInput;
import com.pcd.tripsservice.api.graphql.types.TripStatistics;
import com.pcd.tripsservice.api.graphql.types.UpdateTripPlanInput;
import com.pcd.tripsservice.application.TripBookingService;
import com.pcd.tripsservice.application.TripCriteria;
import com.pcd.tripsservice.application.TripRequest;
import com.pcd.tripsservice.application.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class TripResolver {

    private static final Set<String> STAFF_ROLES = Set.of("ROLE_ADMIN", "ROLE_MANAGER");

    private final TripService tripService;
    private final TripBookingService booking;
    private final TripGraphQlMapper mapper;

    @DgsQuery
    @Staff
    public Trip trip(@InputArgument UUID id) {
        return tripService.find(id).map(mapper::toGraphQl).orElse(null);
    }

    @DgsQuery
    @Staff
    public TripPage trips(@InputArgument TripFilter filter, @InputArgument Integer page, @InputArgument Integer size) {
        TripCriteria criteria = filter == null ? TripCriteria.ANY : mapper.toCriteria(filter);
        return mapper.toGraphQl(tripService.search(criteria, page, size));
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public TripPage myTrips(@InputArgument Integer page, @InputArgument Integer size) {
        UUID accountId = CurrentAccount.id().orElseThrow(() -> new AccessDeniedException("No account"));
        return mapper.toGraphQl(tripService.involving(accountId, page, size));
    }

    @DgsQuery
    @PreAuthorize("isAuthenticated()")
    public TripQuote tripQuote(@InputArgument TripRequestInput input) {
        return mapper.toGraphQl(booking.quote(onBehalfOfCaller(mapper.toRequest(input), false)));
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public Trip requestTrip(@InputArgument TripRequestInput input) {
        return mapper.toGraphQl(booking.book(onBehalfOfCaller(mapper.toRequest(input), true)));
    }

    @DgsQuery
    @ManagerOrAdmin
    public TripStatistics tripStatistics() {
        return mapper.toGraphQl(tripService.statistics());
    }

    @DgsMutation
    @ManagerOrAdmin
    public Trip scheduleTrip(@InputArgument ScheduleTripInput input) {
        return mapper.toGraphQl(tripService.schedule(mapper.toPlan(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Trip updateTripPlan(@InputArgument UUID id, @InputArgument UpdateTripPlanInput input) {
        return mapper.toGraphQl(tripService.reschedule(id, mapper.toChanges(input)));
    }

    @DgsMutation
    @Staff
    public Trip startTrip(@InputArgument UUID id) {
        return mapper.toGraphQl(tripService.start(id));
    }

    @DgsMutation
    @Staff
    public Trip completeTrip(@InputArgument UUID id, @InputArgument CompleteTripInput input) {
        return mapper.toGraphQl(tripService.complete(id, mapper.toCompletion(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Trip cancelTrip(@InputArgument UUID id, @InputArgument String reason) {
        return mapper.toGraphQl(tripService.cancel(id, reason));
    }

    @DgsMutation
    @AdminOnly
    public boolean deleteTrip(@InputArgument UUID id) {
        tripService.delete(id);
        return true;
    }

    @DgsEntityFetcher(name = "Trip")
    public Trip tripReference(Map<String, Object> representation) {
        return trip(UUID.fromString(String.valueOf(representation.get("id"))));
    }

    private TripRequest onBehalfOfCaller(TripRequest request, boolean booking) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean staff = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .anyMatch(STAFF_ROLES::contains);
        if (staff) {
            return request;
        }
        if (request.overridesAssignment()) {
            throw new AccessDeniedException("Only managers can choose the vehicle, driver or customer");
        }
        UUID accountId = CurrentAccount.id().orElseThrow(() -> new AccessDeniedException("No account"));
        return TripRequest.byCustomer(request, booking ? this.booking.customerFor(accountId) : null);
    }
}
