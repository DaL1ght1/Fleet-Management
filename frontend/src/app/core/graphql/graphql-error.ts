import { ApolloError } from '@apollo/client/core';

export function graphQlErrorMessage(error: unknown): string | null {
  if (error instanceof ApolloError) {
    return error.graphQLErrors[0]?.message ?? null;
  }
  return null;
}
