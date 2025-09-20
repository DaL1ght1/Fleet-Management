package com.pcd.vehicles.Configuration;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsRuntimeWiring;
import graphql.scalars.ExtendedScalars;
import graphql.schema.idl.RuntimeWiring;

@DgsComponent
public class ScalarsConfig {

    @DgsRuntimeWiring
    public RuntimeWiring.Builder addScalars(RuntimeWiring.Builder builder) {
        return builder
                .scalar(ExtendedScalars.UUID)
                .scalar(ExtendedScalars.Date)
                .scalar(ExtendedScalars.GraphQLLong);
    }
}
