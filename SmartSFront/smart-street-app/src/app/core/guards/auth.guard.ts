import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

export const authGuard: CanActivateFn = () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  
  if (keycloakService.keycloak.isTokenExpired()) {
    keycloakService.login();
    return false;
  }
  
  return keycloakService.isAuthenticated();
};

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return () => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);
    
    if (!keycloakService.isAuthenticated()) {
      keycloakService.login();
      return false;
    }
    
    if (!keycloakService.hasAnyRole(requiredRoles)) {
      // Redirect to unauthorized page or dashboard
      router.navigate(['/dashboard']);
      return false;
    }
    
    return true;
  };
};

export const adminGuard: CanActivateFn = roleGuard(['admin', 'ADMIN']);
