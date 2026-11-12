package com.pcd.shared.graphql;

import com.netflix.graphql.types.errors.TypedGraphQLError;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;

@AutoConfiguration
@ConditionalOnClass({DataFetcherExceptionResolverAdapter.class, TypedGraphQLError.class})
public class GraphQlErrorAutoConfiguration {

    @Bean
    DomainExceptionResolver domainExceptionResolver() {
        return new DomainExceptionResolver();
    }
}
