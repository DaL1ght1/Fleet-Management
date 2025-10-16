import { Injectable, signal, computed } from '@angular/core';
import { KeycloakService } from '../services/keycloak.service';

export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // Loading states for different operations
  private readonly _loadingState = signal<LoadingState>({});
  
  // Error states for different operations
  private readonly _errorState = signal<ErrorState>({});
  
  // Global notification state
  private readonly _notifications = signal<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
  }>>([]);

  // Computed selectors
  public readonly loadingState = this._loadingState.asReadonly();
  public readonly errorState = this._errorState.asReadonly();
  public readonly notifications = this._notifications.asReadonly();
  
  public readonly isAnyLoading = computed(() => {
    return Object.values(this._loadingState()).some(loading => loading);
  });

  constructor(private keycloakService: KeycloakService) {}

  // Loading state methods
  setLoading(key: string, loading: boolean): void {
    this._loadingState.update(state => ({
      ...state,
      [key]: loading
    }));
  }

  isLoading(key: string): boolean {
    return this._loadingState()[key] || false;
  }

  // Error state methods
  setError(key: string, error: string | null): void {
    this._errorState.update(state => ({
      ...state,
      [key]: error
    }));
  }

  getError(key: string): string | null {
    return this._errorState()[key] || null;
  }

  clearError(key: string): void {
    this.setError(key, null);
  }

  clearAllErrors(): void {
    this._errorState.set({});
  }

  // Notification methods
  showNotification(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ): void {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };

    this._notifications.update(notifications => [...notifications, notification]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  removeNotification(id: string): void {
    this._notifications.update(notifications => 
      notifications.filter(n => n.id !== id)
    );
  }

  clearAllNotifications(): void {
    this._notifications.set([]);
  }

  // Utility methods for common operations
  async withLoading<T>(key: string, operation: () => Promise<T>): Promise<T> {
    try {
      this.setLoading(key, true);
      this.clearError(key);
      const result = await operation();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      this.setError(key, errorMessage);
      this.showNotification(errorMessage, 'error');
      throw error;
    } finally {
      this.setLoading(key, false);
    }
  }
}
