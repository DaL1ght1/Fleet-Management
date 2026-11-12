package com.pcd.geofenceservice.api;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsEntityFetcher;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import com.pcd.geofenceservice.api.graphql.types.Geofence;
import com.pcd.geofenceservice.api.graphql.types.GeofenceAlert;
import com.pcd.geofenceservice.api.graphql.types.GeofenceAlertFilter;
import com.pcd.geofenceservice.api.graphql.types.GeofenceAlertPage;
import com.pcd.geofenceservice.api.graphql.types.GeofenceInput;
import com.pcd.geofenceservice.api.graphql.types.Vehicle;
import com.pcd.geofenceservice.application.AlertCriteria;
import com.pcd.geofenceservice.application.GeofenceService;
import com.pcd.shared.security.AdminOnly;
import com.pcd.shared.security.CurrentAccount;
import com.pcd.shared.security.ManagerOrAdmin;
import com.pcd.shared.security.Staff;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class GeofenceResolver {

    private final GeofenceService geofenceService;
    private final GeofenceGraphQlMapper mapper;

    @DgsQuery
    @Staff
    public List<Geofence> geofences() {
        return geofenceService.all().stream().map(this::toGraphQl).toList();
    }

    @DgsQuery
    @Staff
    public Geofence geofence(@InputArgument UUID id) {
        return geofenceService.find(id).map(this::toGraphQl).orElse(null);
    }

    @DgsQuery
    @ManagerOrAdmin
    public GeofenceAlertPage geofenceAlerts(@InputArgument GeofenceAlertFilter filter, @InputArgument Integer page,
                                            @InputArgument Integer size) {
        AlertCriteria criteria = filter == null ? AlertCriteria.ANY : mapper.toCriteria(filter);
        return mapper.toAlertPage(geofenceService.alerts(criteria, page, size));
    }

    @DgsQuery
    @ManagerOrAdmin
    public int unacknowledgedAlertCount() {
        return Math.toIntExact(geofenceService.unacknowledgedCount());
    }

    @DgsData(parentType = "GeofenceAlert", field = "geofence")
    public Geofence alertGeofence(DgsDataFetchingEnvironment environment) {
        return geofenceService.find(environment.<GeofenceAlert>getSource().getGeofenceId())
                .map(this::toGraphQl)
                .orElse(null);
    }

    @DgsData(parentType = "Vehicle", field = "currentGeofences")
    @Staff
    public List<Geofence> currentGeofences(DgsDataFetchingEnvironment environment) {
        return geofenceService.containing(environment.<Vehicle>getSource().getId()).stream()
                .map(this::toGraphQl)
                .toList();
    }

    @DgsMutation
    @ManagerOrAdmin
    public Geofence createGeofence(@InputArgument GeofenceInput input) {
        return toGraphQl(geofenceService.define(mapper.toDefinition(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Geofence updateGeofence(@InputArgument UUID id, @InputArgument GeofenceInput input) {
        return toGraphQl(geofenceService.redefine(id, mapper.toDefinition(input)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public Geofence setGeofenceActive(@InputArgument UUID id, @InputArgument Boolean active) {
        return toGraphQl(geofenceService.setActive(id, active));
    }

    @DgsMutation
    @AdminOnly
    public boolean deleteGeofence(@InputArgument UUID id) {
        geofenceService.delete(id);
        return true;
    }

    @DgsMutation
    @ManagerOrAdmin
    public GeofenceAlert acknowledgeGeofenceAlert(@InputArgument UUID id) {
        return mapper.toGraphQl(geofenceService.acknowledge(id, CurrentAccount.id().orElse(null)));
    }

    @DgsMutation
    @ManagerOrAdmin
    public int acknowledgeAllGeofenceAlerts() {
        return geofenceService.acknowledgeAll(CurrentAccount.id().orElse(null));
    }

    @DgsEntityFetcher(name = "Vehicle")
    public Vehicle vehicleReference(Map<String, Object> representation) {
        return mapper.vehicleReference(UUID.fromString(String.valueOf(representation.get("id"))));
    }

    @DgsEntityFetcher(name = "Geofence")
    public Geofence geofenceReference(Map<String, Object> representation) {
        return geofence(UUID.fromString(String.valueOf(representation.get("id"))));
    }

    private Geofence toGraphQl(com.pcd.geofenceservice.domain.Geofence geofence) {
        return mapper.toGraphQl(geofence, geofenceService.vehiclesInside(geofence.getId()));
    }
}
