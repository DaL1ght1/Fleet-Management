export const environment = {
  production: true,
  graphqlEndpoint: 'http://localhost:4000/graphql', // Update with production URL
  keycloak: {
    url: 'http://localhost:8083/', // Update with production Keycloak URL
    realm: 'Smart-Street',
    clientId: 'ssn'
  }
};
