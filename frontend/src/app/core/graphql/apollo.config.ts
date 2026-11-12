import { inject } from '@angular/core';
import { HttpLink } from 'apollo-angular/http';
import { ApolloClientOptions, InMemoryCache, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export function createApollo(): ApolloClientOptions<unknown> {
  const httpLink = inject(HttpLink);
  const auth = inject(AuthService);

  const authLink = setContext(async (_, { headers }) => {
    const token = await auth.accessToken();
    return { headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers };
  });

  return {
    link: from([authLink, httpLink.create({ uri: environment.graphqlEndpoint })]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', errorPolicy: 'none' },
      query: { fetchPolicy: 'network-only', errorPolicy: 'none' },
      mutate: { errorPolicy: 'none' },
    },
  };
}
