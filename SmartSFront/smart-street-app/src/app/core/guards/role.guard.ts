import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

export interface RoleGuardData {
  roles: string[];
  redirectUrl?: string;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

export const roleGuard: CanActivateFn = (route, state) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  // Check if user is authenticated first
  if (!keycloakService.isAuthenticated()) {
    keycloakService.login();
    return false;
  }

  // Get role requirements from route data
  const roleData = route.data as RoleGuardData;
  
  if (!roleData || !roleData.roles || roleData.roles.length === 0) {
    // No role requirements - allow access
    return true;
  }

  const userRoles = keycloakService.getAllRoles();
  const requiredRoles = roleData.roles;
  const requireAll = roleData.requireAll || false;
  
  // Check role requirements
  const hasAccess = requireAll 
    ? requiredRoles.every(role => userRoles.includes(role))
    : requiredRoles.some(role => userRoles.includes(role));

  if (hasAccess) {
    return true;
  }

  // Access denied - redirect
  const redirectUrl = roleData.redirectUrl || '/dashboard';
  router.navigate([redirectUrl]);
  return false;
};

// Helper function to create role guard data
export function createRoleGuardData(
  roles: string[],
  options: { redirectUrl?: string; requireAll?: boolean } = {}
): RoleGuardData {
  return {
    roles,
    redirectUrl: options.redirectUrl || '/dashboard',
    requireAll: options.requireAll || false
  };
}

// Predefined role configurations
export const RoleConfig = {
  ADMIN_ONLY: createRoleGuardData(['ADMIN']),
  MANAGER_OR_ADMIN: createRoleGuardData(['MANAGER', 'ADMIN']),
  DRIVER_ONLY: createRoleGuardData(['DRIVER']),
  DRIVER_OR_MANAGER: createRoleGuardData(['DRIVER', 'MANAGER']),
  ANY_ROLE: createRoleGuardData(['ADMIN', 'MANAGER', 'DRIVER', 'USER']),
  STAFF_ONLY: createRoleGuardData(['ADMIN', 'MANAGER', 'DRIVER']) // All except regular users
};