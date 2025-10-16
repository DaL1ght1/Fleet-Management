import { Injectable, inject, signal } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map, catchError, of, firstValueFrom } from 'rxjs';
import { gql } from 'apollo-angular';
import { KeycloakService } from '../core/services/keycloak.service';
import { DriverService, Driver, DriverInput, DriverStatus } from './driver.service';

export interface UserSyncResult {
  success: boolean;
  message: string;
  driver?: Driver;
  isNewUser?: boolean;
}

// GraphQL Queries for user synchronization
const GET_DRIVER_BY_EMAIL = gql`
  query GetDriverByEmail($email: String!) {
    driverByEmail(email: $email) {
      id
      firstName
      lastName
      email
    }
  }
`;

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($userDto: UserDto!) {
    CreateUser(userDto: $userDto) {
      id
      firstName
      lastName
      email
      licenseNumber
      phoneNumber
    }
  }
`;

export interface UserDto {
  firstName?: string;
  lastName?: string;
  email: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSyncService {
  private apollo = inject(Apollo);
  private keycloakService = inject(KeycloakService);
  private driverService = inject(DriverService);

  // Reactive state
  private readonly _syncInProgress = signal<boolean>(false);
  private readonly _lastSyncResult = signal<UserSyncResult | null>(null);

  public readonly syncInProgress = this._syncInProgress.asReadonly();
  public readonly lastSyncResult = this._lastSyncResult.asReadonly();

  /**
   * Synchronize the current Keycloak user with the backend
   * This method should be called after successful Keycloak authentication
   */
  async synchronizeCurrentUser(): Promise<UserSyncResult> {
    if (!this.keycloakService.isLoggedIn()) {
      const result: UserSyncResult = {
        success: false,
        message: 'User is not authenticated with Keycloak'
      };
      this._lastSyncResult.set(result);
      return result;
    }

    const userProfile = this.keycloakService.userProfile();
    if (!userProfile || !userProfile.email) {
      const result: UserSyncResult = {
        success: false,
        message: 'Unable to get user profile from Keycloak'
      };
      this._lastSyncResult.set(result);
      return result;
    }

    return this.synchronizeUser(userProfile);
  }

  /**
   * Synchronize a specific user with the backend
   */
  private async synchronizeUser(userProfile: any): Promise<UserSyncResult> {
    this._syncInProgress.set(true);

    try {

      // Check if driver already exists
      const existingDriver = await this.checkDriverExists(userProfile.email);
      
      if (existingDriver) {
        const result: UserSyncResult = {
          success: true,
          message: 'User already exists in backend',
          driver: existingDriver,
          isNewUser: false
        };
        this._lastSyncResult.set(result);
        return result;
      }

      // For admin@admin.com, skip user creation as it's an admin user
      if (userProfile.email === 'admin@admin.com') {
        const result: UserSyncResult = {
          success: true,
          message: 'Admin user - no driver record needed',
          isNewUser: false
        };
        this._lastSyncResult.set(result);
        return result;
      }

      // Create new driver using the backend's CreateUser mutation
      const newDriver = await this.createUserInBackend(userProfile);

      if (newDriver) {
        const result: UserSyncResult = {
          success: true,
          message: 'Successfully created new user in backend',
          driver: newDriver,
          isNewUser: true
        };
        this._lastSyncResult.set(result);
        return result;
      } else {
        throw new Error('Failed to create driver in backend');
      }

    } catch (error) {
      // Continue with app functionality despite sync failure
      const result: UserSyncResult = {
        success: false,
        message: `Synchronization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      this._lastSyncResult.set(result);
      return result;
    } finally {
      this._syncInProgress.set(false);
    }
  }

  /**
   * Check if a driver already exists by email
   */
  private async checkDriverExists(email: string): Promise<Driver | null> {
    try {
      const queryPromise = firstValueFrom(
        this.apollo.query<{driverByEmail: Driver}>({
          query: GET_DRIVER_BY_EMAIL,
          variables: { email },
          fetchPolicy: 'network-only'
        })
      );
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('checkDriverExists timeout')), 5000);
      });
      
      const result = await Promise.race([queryPromise, timeoutPromise]);
      
      return result.data?.driverByEmail || null;
    } catch (error) {
      // Driver not found by email query (this is normal for new users)
      return null;
    }
  }

  /**
   * Create a new driver in the backend using the CreateUser mutation
   */
  private async createUserInBackend(userProfile: any): Promise<Driver | null> {
    try {
      const userDto: UserDto = {
        firstName: userProfile.firstName || undefined,
        lastName: userProfile.lastName || undefined,
        email: userProfile.email,
        licenseNumber: undefined, // Will be filled later by the user
        phoneNumber: undefined // Will be filled later by the user
      };

      const mutationPromise = firstValueFrom(
        this.apollo.mutate<{CreateUser: any}>({
          mutation: CREATE_USER_MUTATION,
          variables: { userDto }
        })
      );
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('createUserInBackend timeout')), 5000);
      });
      
      const result = await Promise.race([mutationPromise, timeoutPromise]);

      const createdUser = result.data?.CreateUser;
      if (createdUser) {
        // Convert the created user to Driver format
        const driver: Driver = {
          id: createdUser.id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          phone: createdUser.phoneNumber || undefined,
          phoneNumber: createdUser.phoneNumber || undefined, // Keep both for compatibility
          licenseNumber: createdUser.licenseNumber || undefined,
          status: DriverStatus.ACTIVE, // Default status for new users
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Update the driver service cache
        this.driverService['_drivers'].update(drivers => [...drivers, driver]);
        
        return driver;
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Force re-sync the current user (useful for troubleshooting)
   */
  async forceSyncCurrentUser(): Promise<UserSyncResult> {
    // This will bypass any caching and force a fresh sync
    return this.synchronizeCurrentUser();
  }

  /**
   * Get sync status information
   */
  getSyncStatus(): {
    inProgress: boolean;
    lastResult: UserSyncResult | null;
  } {
    return {
      inProgress: this._syncInProgress(),
      lastResult: this._lastSyncResult()
    };
  }
}