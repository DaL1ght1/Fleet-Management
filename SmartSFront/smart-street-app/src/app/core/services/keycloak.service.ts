import { Injectable, signal, inject } from '@angular/core';
import Keycloak, { KeycloakInstance, KeycloakProfile } from 'keycloak-js';
import { UserProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private _keycloak: Keycloak | undefined;
  
  // Common roles that all users have - filtered out from display
  // These are standard Keycloak realm and client roles assigned to users:
  // - 'default-roles-smart-street': Default realm roles for the Smart-Street realm
  // - 'offline_access': Allows offline token refresh
  // - 'uma_authorization': User-Managed Access authorization
  // - 'account': Account management client roles
  // - 'realm_management': Realm management roles
  // - 'manage-account': Account self-management
  // - 'manage-account-links': Account linking management
  // - 'view-profile': Profile viewing permission
  // - 'delete-account': Account deletion permission
  // - 'view-applications': View applications permission
  // - 'view-consent': View consent permission
  // - 'manage-consent': Manage consent permission
  // - 'view-groups': View groups permission
  // - 'edit_profile': Edit profile permission
  private readonly commonRoles = [
    'default-roles-smart-street', 
    'offline_access', 
    'uma_authorization',
    'account',
    'realm_management',
    'manage-account',
    'manage-account-links',
    'view-profile',
    'delete-account',
    'view-applications',
    'view-consent',
    'manage-consent',
    'view-groups',
    'edit_profile'
  ];
  
  // Signals for reactive state management
  public readonly userProfile = signal<UserProfile | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);
  public readonly roles = signal<string[]>([]);
  public readonly filteredRoles = signal<string[]>([]);

  get keycloak(): KeycloakInstance {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      });
    }
    return this._keycloak;
  }

  get userId(): string | null {
    return (this._keycloak?.tokenParsed?.sub as string) ?? null;
  }

  getUserId(): string | null {
    return this.userId;
  }

  async init(): Promise<boolean> {
    this.isLoading.set(true);
    
    try {
      console.log('🔐 Initializing Keycloak...');
      const authenticated = await this.keycloak.init({ 
        onLoad: 'login-required',
        checkLoginIframe: false
      });

      console.log('🔐 Keycloak authentication status:', authenticated);
      this.isAuthenticated.set(authenticated);

      if (authenticated) {
        const kcProfile: KeycloakProfile = await this.keycloak.loadUserProfile();
        const userRoles = (this.keycloak.tokenParsed?.realm_access?.roles as string[]) || [];
        
        const profile: UserProfile = {
          id: (this.keycloak.tokenParsed?.sub as string) ?? undefined,
          username: kcProfile.username ?? undefined,
          email: kcProfile.email ?? undefined,
          firstName: kcProfile.firstName ?? undefined,
          lastName: kcProfile.lastName ?? undefined,
          roles: userRoles,
          token: this.keycloak.token ?? undefined,
        };

        this.userProfile.set(profile);
        this.roles.set(userRoles);
        const filtered = this.filterCommonRoles(userRoles);
        
        // Debug logging to see what roles are being filtered
        console.log('🔐 All user roles from Keycloak:', userRoles);
        console.log('🔐 Common roles to filter:', this.commonRoles);
        console.log('🔐 Filtered roles for display:', filtered);
        
        this.filteredRoles.set(filtered);

        // Set up token refresh
        this.setupTokenRefresh();
        
        // Trigger user synchronization after successful authentication
        // Temporarily disabled to debug drivers loading
        console.log('🔧 User synchronization temporarily disabled to debug drivers loading');
        // this.triggerUserSynchronization();
      }

      this.isLoading.set(false);
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      console.log('🔧 Creating development fallback...');
      
      // Development fallback when Keycloak is down
      if (!environment.production) {
        const mockProfile: UserProfile = {
          id: 'dev-user-123',
          username: 'developer',
          email: 'developer@example.com',
          firstName: 'Dev',
          lastName: 'User',
          roles: ['admin', 'manager'],
          token: 'dev-mock-token-for-development'
        };
        
        this.userProfile.set(mockProfile);
        this.isAuthenticated.set(true);
        this.roles.set(['admin', 'manager']);
        this.filteredRoles.set(['admin', 'manager']);
        
        console.log('🔧 Development user created:', mockProfile);
      }
      
      this.isLoading.set(false);
      return !environment.production; // Return true in development, false in production
    }
  }

  private setupTokenRefresh(): void {
    // Refresh token every 30 seconds if it will expire in the next 60 seconds
    setInterval(async () => {
      try {
        await this.keycloak.updateToken(60);
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.login();
      }
    }, 30000);
  }

  login(): void {
    this._keycloak?.login();
  }

  async logout(): Promise<void> {
    this.userProfile.set(null);
    this.isAuthenticated.set(false);
    this.roles.set([]);
    this.filteredRoles.set([]);
    
    await this.keycloak.logout({ 
      redirectUri: window.location.origin 
    });
  }

  accountManagement(): void {
    this._keycloak?.accountManagement();
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Filters out common roles that all users have
   * @param roles - Array of user roles
   * @returns Filtered array without common roles
   */
  private filterCommonRoles(roles: string[]): string[] {
    return roles.filter(role => !this.commonRoles.includes(role));
  }

  /**
   * Gets user roles without common roles for display purposes
   * @returns Filtered roles array
   */
  getFilteredRoles(): string[] {
    return this.filteredRoles();
  }

  /**
   * Gets all user roles including common ones
   * @returns All roles array
   */
  getAllRoles(): string[] {
    return this.roles();
  }

  /**
   * Gets the list of common roles that are filtered out
   * @returns Array of common role names
   */
  getCommonRoles(): string[] {
    return [...this.commonRoles];
  }

  async getValidToken(): Promise<string> {
    try {
      // Check if token needs refresh (will expire in next 30 seconds)
      await this.keycloak.updateToken(30);
      
      const token = this.keycloak.token;
      if (typeof token === 'string' && token.split('.').length === 3) {
        return token;
      }
      throw new Error('Invalid token format');
    } catch (error) {
      console.error('Failed to get valid token:', error);
      
      // Return mock token in development
      if (!environment.production && this.userProfile()?.token) {
        console.log('🔧 Returning development mock token');
        return this.userProfile()!.token!;
      }
      
      this.login();
      throw new Error('No valid token available');
    }
  }

  /**
   * Set user synchronization callback
   * This allows the app to inject the user sync service without circular dependency
   */
  public userSyncCallback: (() => Promise<void>) | null = null;

  /**
   * Trigger user synchronization with the backend
   * This is called after successful authentication to ensure the user exists in the backend
   * Run in background to not block app initialization
   */
  private triggerUserSynchronization(): void {
    if (this.userSyncCallback) {
      // Run user sync in background to not block app loading
      setTimeout(async () => {
        try {
          console.log('🔄 Running user synchronization in background...');
          
          // Add a timeout to prevent hanging
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('User synchronization timeout')), 5000);
          });
          
          await Promise.race([
            this.userSyncCallback!(),
            timeoutPromise
          ]);
          
          console.log('✅ Background user synchronization completed');
        } catch (error) {
          console.error('❌ Background user synchronization failed:', error);
          console.log('🔄 App functionality not affected');
        }
      }, 100); // Small delay to let app initialize first
    } else {
      console.log('⚠️ User sync callback not set, skipping synchronization');
    }
  }
}
