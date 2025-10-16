import { Injectable, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, of } from 'rxjs';
import { gql } from 'apollo-angular';
import { FetchPolicy } from '@apollo/client/core';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

export interface CustomerFilters {
  search?: string;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

// GraphQL Queries and Mutations
const GET_ALL_CUSTOMERS = gql`
  query GetAllCustomers {
    customers {
      id
      firstName
      lastName
      email
      licenseNumber
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const GET_CUSTOMER_BY_ID = gql`
  query GetCustomerById($id: UUID!) {
    getCustomerById(id: $id) {
      id
      firstName
      lastName
      email
      licenseNumber
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CUSTOMER = gql`
  mutation CreateCustomer($input: UserDto!) {
    createCustomer(input: $input) {
      id
      firstName
      lastName
      email
      licenseNumber
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: UUID!, $input: UserDto!) {
    updateCustomer(id: $id, input: $input) {
      id
      firstName
      lastName
      email
      licenseNumber
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: UUID!) {
    deleteCustomer(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apollo = inject(Apollo);

  // Reactive signals
  private _customers = signal<Customer[]>([]);
  private _selectedCustomer = signal<Customer | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  public customers = this._customers.asReadonly();
  public selectedCustomer = this._selectedCustomer.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  /**
   * Load all customers from the server
   */
  getCustomers(): Observable<CustomerListResponse | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.query<{customers: Customer[]}>(
      {
        query: GET_ALL_CUSTOMERS,
        fetchPolicy: 'cache-and-network' as FetchPolicy
      }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.customers) {
          // Convert date strings to Date objects
          const customers = result.data.customers.map(customer => ({
            ...customer,
            createdAt: customer.createdAt ? new Date(customer.createdAt) : undefined,
            updatedAt: customer.updatedAt ? new Date(customer.updatedAt) : undefined
          }));
          
          this._customers.set(customers);
          
          // Return in the expected format
          return {
            customers,
            total: customers.length,
            page: 1,
            pageSize: customers.length
          };
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to load customers');
        return of(null);
      })
    );
  }

  /**
   * Get a single customer by ID
   */
  getCustomer(id: string): Observable<Customer | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.query<{getCustomerById: Customer}>({
      query: GET_CUSTOMER_BY_ID,
      variables: { id },
      fetchPolicy: 'cache-and-network' as FetchPolicy
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.getCustomerById) {
          const customer = {
            ...result.data.getCustomerById,
            createdAt: result.data.getCustomerById.createdAt ? new Date(result.data.getCustomerById.createdAt) : undefined,
            updatedAt: result.data.getCustomerById.updatedAt ? new Date(result.data.getCustomerById.updatedAt) : undefined
          };
          this._selectedCustomer.set(customer);
          return customer;
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to load customer');
        return of(null);
      })
    );
  }

  /**
   * Create a new customer
   */
  createCustomer(input: CustomerInput): Observable<Customer | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{createCustomer: Customer}>({
      mutation: CREATE_CUSTOMER,
      variables: { input },
      refetchQueries: [{ query: GET_ALL_CUSTOMERS }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.createCustomer) {
          const customer = {
            ...result.data.createCustomer,
            createdAt: result.data.createCustomer.createdAt ? new Date(result.data.createCustomer.createdAt) : undefined,
            updatedAt: result.data.createCustomer.updatedAt ? new Date(result.data.createCustomer.updatedAt) : undefined
          };
          
          this._customers.update(customers => [...customers, customer]);
          return customer;
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to create customer');
        return of(null);
      })
    );
  }

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, input: CustomerInput): Observable<Customer | null> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{updateCustomer: Customer}>({
      mutation: UPDATE_CUSTOMER,
      variables: { id, input },
      refetchQueries: [{ query: GET_ALL_CUSTOMERS }, { query: GET_CUSTOMER_BY_ID, variables: { id } }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        if (result.data?.updateCustomer) {
          const customer = {
            ...result.data.updateCustomer,
            createdAt: result.data.updateCustomer.createdAt ? new Date(result.data.updateCustomer.createdAt) : undefined,
            updatedAt: result.data.updateCustomer.updatedAt ? new Date(result.data.updateCustomer.updatedAt) : undefined
          };
          
          this._customers.update(customers => 
            customers.map(c => c.id === id ? customer : c)
          );
          
          if (this._selectedCustomer()?.id === id) {
            this._selectedCustomer.set(customer);
          }
          
          return customer;
        }
        return null;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to update customer');
        return of(null);
      })
    );
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Observable<boolean> {
    this.setLoading(true);
    this.clearError();

    return this.apollo.mutate<{deleteCustomer: boolean}>({
      mutation: DELETE_CUSTOMER,
      variables: { id },
      refetchQueries: [{ query: GET_ALL_CUSTOMERS }]
    }).pipe(
      map(result => {
        this.setLoading(false);
        const success = result.data?.deleteCustomer || false;
        
        if (success) {
          this._customers.update(customers => customers.filter(c => c.id !== id));
          if (this._selectedCustomer()?.id === id) {
            this._selectedCustomer.set(null);
          }
        }
        
        return success;
      }),
      catchError(error => {
        this.setLoading(false);
        this.setError('Failed to delete customer');
        return of(false);
      })
    );
  }

  /**
   * Clear the selected customer
   */
  clearSelectedCustomer(): void {
    this._selectedCustomer.set(null);
  }

  // Private helper methods
  private setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  private setError(error: string | null): void {
    this._error.set(error);
  }

  private clearError(): void {
    this._error.set(null);
  }
}