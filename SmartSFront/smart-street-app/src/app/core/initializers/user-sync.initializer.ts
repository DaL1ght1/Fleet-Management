import { inject } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';
import { UserSyncService } from '../../services/user-sync.service';

/**
 * Initialize user synchronization after Keycloak is ready
 * This sets up the callback to ensure users are synchronized with the backend
 */
export function initializeUserSync() {
  return async () => {
    const keycloakService = inject(KeycloakService);
    const userSyncService = inject(UserSyncService);
    
    // Set up the user sync callback
    keycloakService.userSyncCallback = async () => {
      const result = await userSyncService.synchronizeCurrentUser();
      
      if (result.success) {
        console.log('✅ User synchronization completed successfully:', result.message);
        if (result.isNewUser) {
          console.log('🆕 New user created in backend:', result.driver?.email);
        }
      } else {
        console.warn('⚠️ User synchronization failed:', result.message);
      }
    };
    
    console.log('🔧 User synchronization callback registered');
  };
}