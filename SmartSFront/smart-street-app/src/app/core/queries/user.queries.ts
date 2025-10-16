import { gql } from 'apollo-angular';

/**
 * Get all users query
 */
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      email
      phoneNumber
      role
      createdAt
      updatedAt
    }
  }
`;

/**
 * Get user by ID query
 */
export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      firstName
      lastName
      email
      phoneNumber
      role
      createdAt
      updatedAt
    }
  }
`;

/**
 * Create user mutation
 */
export const CREATE_USER = gql`
  mutation CreateUser($userDto: UserDto!) {
    CreateUser(userDto: $userDto) {
      id
      firstName
      lastName
      email
      phoneNumber
      role
      createdAt
      updatedAt
    }
  }
`;

/**
 * Update user mutation
 */
export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      phoneNumber
      role
      createdAt
      updatedAt
    }
  }
`;

/**
 * Delete user mutation
 */
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
