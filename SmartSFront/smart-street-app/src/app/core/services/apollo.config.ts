import { inject } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, from, WatchQueryFetchPolicy, FetchPolicy, ErrorPolicy } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { KeycloakService } from './keycloak.service';
import { environment } from '../../../environments/environment';

export function createApollo() {
  const httpLink = inject(HttpLink);
  const keycloakService = inject(KeycloakService);

  const http = httpLink.create({
    uri: environment.graphqlEndpoint,
  });

  // Authentication link
  const authLink = setContext(async (_, { headers }) => {
    try {
      const token = await keycloakService.getValidToken();
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      };
    } catch (error) {
      // For development when Keycloak is down, proceed without token
      return { headers };
    }
  });

  // Error handling link
  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.error('GraphQL error:', message, { locations, path, extensions });
      });
    }

    if (networkError) {
      console.error('Network error:', networkError);
      
      // Handle authentication errors
      if ('statusCode' in networkError && networkError.statusCode === 401) {
        keycloakService.login();
      }
    }
  });

  return {
    link: from([errorLink, authLink, http]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            getAllVehicle: {
              merge: false,
            },
            users: {
              merge: false,
            },
            drivers: {
              merge: false,
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all' as ErrorPolicy,
        fetchPolicy: 'cache-and-network' as WatchQueryFetchPolicy,
      },
      query: {
        errorPolicy: 'all' as ErrorPolicy,
        fetchPolicy: 'cache-first' as FetchPolicy,
      },
      mutate: {
        errorPolicy: 'all' as ErrorPolicy,
      },
    },
  };
}
