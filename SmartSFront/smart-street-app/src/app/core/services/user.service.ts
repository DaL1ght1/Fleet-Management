import { Injectable, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { AppStateService } from '../state/app-state.service';
import { User, CreateUserDto, UpdateUserInput } from '../models/user.model';
import { GET_USERS, CREATE_USER, UPDATE_USER, DELETE_USER, GET_USER_BY_ID } from '../queries/user.queries';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apollo = inject(Apollo);
  private appState = inject(AppStateService);

  // Reactive state
  private readonly _users = signal<User[]>([]);
  private readonly _selectedUser = signal<User | null>(null);

  // Public readonly signals
  public readonly users = this._users.asReadonly();
  public readonly selectedUser = this._selectedUser.asReadonly();

  /**
   * Load all users from the server
   */
  async loadUsers(): Promise<void> {
    await this.appState.withLoading('users-load', async () => {
      try {
        const result = await this.apollo.query<{ users: User[] }>({
          query: GET_USERS,
          fetchPolicy: 'cache-and-network' as any
        }).toPromise();

        if (result?.data?.users) {
          this._users.set(result.data.users);
          this.appState.showNotification('Users loaded successfully', 'success');
        }
      } catch (error) {
        console.error('Error loading users:', error);
        this._users.set([]);
        throw error;
      }
    });
  }

  /**
   * Load a specific user by ID
   */
  async loadUser(id: string): Promise<User | null> {
    return this.appState.withLoading(`user-${id}`, async () => {
      try {
        const result = await this.apollo.query<{ getUserById: User }>({
          query: GET_USER_BY_ID,
          variables: { id },
          fetchPolicy: 'cache-first'
        }).toPromise();

        if (result?.data?.getUserById) {
          const user = result.data.getUserById;
          this._selectedUser.set(user);
          return user;
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        console.error(`Error loading user ${id}:`, error);
        this._selectedUser.set(null);
        throw error;
      }
    });
  }

  /**
   * Create a new user
   */
  async createUser(userDto: CreateUserDto): Promise<User> {
    return this.appState.withLoading('user-create', async () => {
      try {
        const result = await this.apollo.mutate<{ CreateUser: User }>({
          mutation: CREATE_USER,
          variables: { userDto }
        }).toPromise();

        if (result?.data?.CreateUser) {
          const newUser = result.data.CreateUser;
          this._users.update(users => [...users, newUser]);
          this.appState.showNotification('User created successfully', 'success');
          return newUser;
        } else {
          throw new Error('Failed to create user');
        }
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    });
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    return this.appState.withLoading(`user-update-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ updateUser: User }>({
          mutation: UPDATE_USER,
          variables: { id, input }
        }).toPromise();

        if (result?.data?.updateUser) {
          const updatedUser = result.data.updateUser;
          this._users.update(users => 
            users.map(u => u.id === id ? updatedUser : u)
          );
          if (this._selectedUser()?.id === id) {
            this._selectedUser.set(updatedUser);
          }
          this.appState.showNotification('User updated successfully', 'success');
          return updatedUser;
        } else {
          throw new Error('Failed to update user');
        }
      } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    await this.appState.withLoading(`user-delete-${id}`, async () => {
      try {
        const result = await this.apollo.mutate<{ deleteUser: boolean }>({
          mutation: DELETE_USER,
          variables: { id }
        }).toPromise();

        if (result?.data?.deleteUser) {
          this._users.update(users => users.filter(u => u.id !== id));
          if (this._selectedUser()?.id === id) {
            this._selectedUser.set(null);
          }
          this.appState.showNotification('User deleted successfully', 'success');
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        throw error;
      }
    });
  }

  /**
   * Get loading state for specific operations
   */
  isLoading(operation: string): boolean {
    return this.appState.isLoading(operation);
  }

  /**
   * Get error state for specific operations
   */
  getError(operation: string): string | null {
    return this.appState.getError(operation);
  }
}
