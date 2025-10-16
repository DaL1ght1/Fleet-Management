import { Injectable, inject, computed, signal } from '@angular/core';
import { KeycloakService } from './keycloak.service';

export interface VisibilityConfig {
  allowedRoles?: string[];
  deniedRoles?: string[];
  requireAll?: boolean;
  fallback?: boolean; // Default visibility when no roles are specified
}

export interface MenuItemConfig {
  label: string;
  key: string;
  route: string;
  icon: string;
  badge?: string;
  visibilityConfig?: VisibilityConfig;
}

@Injectable({
  providedIn: 'root'
})
export class RoleVisibilityService {
  private keycloakService = inject(KeycloakService);

  // Computed signal for user roles (all roles for authorization checks)
  private readonly userRoles = computed(() => this.keycloakService.getAllRoles());
  
  // Computed signal for filtered user roles (for display purposes)
  private readonly filteredUserRoles = computed(() => this.keycloakService.getFilteredRoles());

  /**
   * Check if content should be visible based on role configuration
   */
  isVisible(config: VisibilityConfig): boolean {
    if (!config.allowedRoles && !config.deniedRoles) {
      return config.fallback !== false; // Default to true if no config
    }

    const userRoles = this.userRoles();
    
    // Check denied roles first (takes precedence)
    if (config.deniedRoles && config.deniedRoles.length > 0) {
      const hasDeniedRole = config.deniedRoles.some(role => userRoles.includes(role));
      if (hasDeniedRole) {
        return false;
      }
    }

    // Check allowed roles
    if (config.allowedRoles && config.allowedRoles.length > 0) {
      if (config.requireAll) {
        return config.allowedRoles.every(role => userRoles.includes(role));
      } else {
        return config.allowedRoles.some(role => userRoles.includes(role));
      }
    }

    return config.fallback !== false;
  }

  /**
   * Get navigation items filtered by role visibility
   */
  getVisibleNavItems(items: MenuItemConfig[]): MenuItemConfig[] {
    return items.filter(item => {
      if (!item.visibilityConfig) {
        return true; // No restrictions
      }
      return this.isVisible(item.visibilityConfig);
    });
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.userRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    const userRoles = this.userRoles();
    return roles.every(role => userRoles.includes(role));
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasAnyRole(['ADMIN']);
  }

  /**
   * Check if user is manager or admin
   */
  isManagerOrAdmin(): boolean {
    return this.hasAnyRole(['MANAGER', 'ADMIN']);
  }

  /**
   * Check if user is driver
   */
  isDriver(): boolean {
    return this.hasAnyRole(['DRIVER']);
  }

  /**
   * Check if user is regular user (not staff)
   */
  isUser(): boolean {
    return this.hasAnyRole(['USER']) && !this.hasAnyRole(['ADMIN', 'MANAGER', 'DRIVER']);
  }

  /**
   * Check if user is staff (admin, manager, or driver)
   */
  isStaff(): boolean {
    return this.hasAnyRole(['ADMIN', 'MANAGER', 'DRIVER']);
  }

  /**
   * Get user's primary role (highest in hierarchy)
   */
  getPrimaryRole(): string | null {
    const userRoles = this.userRoles();
    
    // Role hierarchy (highest to lowest)
    const roleHierarchy = ['ADMIN', 'MANAGER', 'DRIVER', 'USER'];
    
    for (const role of roleHierarchy) {
      if (userRoles.includes(role)) {
        return role;
      }
    }
    
    return userRoles.length > 0 ? userRoles[0] : null;
  }

  /**
   * Get display-friendly role name
   */
  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      'ADMIN': 'Administrator',
      'MANAGER': 'Manager',
      'DRIVER': 'Driver',
      'USER': 'User'
    };
    
    return roleNames[role] || role;
  }

  /**
   * Get all user role display names (filtered - without common roles)
   */
  getUserRoleDisplayNames(): string[] {
    return this.filteredUserRoles().map(role => this.getRoleDisplayName(role));
  }
  
  /**
   * Get all user role display names (unfiltered - includes all roles)
   */
  getAllUserRoleDisplayNames(): string[] {
    return this.userRoles().map(role => this.getRoleDisplayName(role));
  }
}

// Predefined visibility configurations
export const VisibilityRules = {
  ADMIN_ONLY: { allowedRoles: ['ADMIN'] } as VisibilityConfig,
  MANAGER_OR_ADMIN: { allowedRoles: ['MANAGER', 'ADMIN'] } as VisibilityConfig,
  DRIVER_ONLY: { allowedRoles: ['DRIVER'] } as VisibilityConfig,
  STAFF_ONLY: { allowedRoles: ['ADMIN', 'MANAGER', 'DRIVER'] } as VisibilityConfig,
  USER_ONLY: { allowedRoles: ['USER'] } as VisibilityConfig,
  NOT_USER: { deniedRoles: ['USER'] } as VisibilityConfig, // Staff only (opposite of USER_ONLY)
  AUTHENTICATED_ONLY: { fallback: true } as VisibilityConfig, // All authenticated users
  PUBLIC: { fallback: true } as VisibilityConfig // Everyone (no restrictions)
};
