import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';
import { AppStateService } from '../state/app-state.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);
  private appState = inject(AppStateService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry({
        count: 2,
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Only retry on network errors or 5xx server errors
          if (this.shouldRetry(error)) {
            console.log(`Retrying request (attempt ${retryCount + 1}):`, req.url);
            return new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
          throw error;
        }
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, req))
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    // Retry on network errors or server errors (5xx)
    return !error.status || (error.status >= 500 && error.status < 600);
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>): Observable<never> {
    let userMessage: string;
    let shouldShowSnackbar = true;

    // Only log detailed errors if they're not GraphQL 400 errors (which are common during development)
    const isGraphQLError = req.url?.includes('/graphql') && error.status === 400;
    if (!isGraphQLError || !environment.production) {
      console.error('HTTP Error occurred:', {
        url: req.url,
        status: error.status,
        message: error.message,
        error: error.error
      });
    }

    switch (error.status) {
      case 0:
        // Network error
        userMessage = 'Network error. Please check your connection and try again.';
        this.appState.showNotification(userMessage, 'error', 8000);
        break;

      case 400:
        // Bad Request
        userMessage = this.extractErrorMessage(error) || 'Invalid request. Please check your input.';
        this.appState.showNotification(userMessage, 'error');
        break;

      case 401:
        // Unauthorized
        userMessage = 'Your session has expired. Please log in again.';
        this.appState.showNotification(userMessage, 'warning', 6000);
        this.keycloakService.login();
        shouldShowSnackbar = false;
        break;

      case 403:
        // Forbidden
        userMessage = 'You do not have permission to perform this action.';
        this.appState.showNotification(userMessage, 'error');
        break;

      case 404:
        // Not Found
        userMessage = this.extractErrorMessage(error) || 'The requested resource was not found.';
        this.appState.showNotification(userMessage, 'error');
        break;

      case 409:
        // Conflict
        userMessage = this.extractErrorMessage(error) || 'A conflict occurred. The resource may already exist.';
        this.appState.showNotification(userMessage, 'error');
        break;

      case 422:
        // Unprocessable Entity
        userMessage = this.extractErrorMessage(error) || 'Validation failed. Please check your input.';
        this.appState.showNotification(userMessage, 'error');
        break;

      case 429:
        // Too Many Requests
        userMessage = 'Too many requests. Please wait a moment and try again.';
        this.appState.showNotification(userMessage, 'warning', 6000);
        break;

      case 500:
        // Internal Server Error
        userMessage = 'Server error. Please try again later.';
        this.appState.showNotification(userMessage, 'error');
        break;

      case 502:
      case 503:
      case 504:
        // Bad Gateway, Service Unavailable, Gateway Timeout
        userMessage = 'Service is temporarily unavailable. Please try again later.';
        this.appState.showNotification(userMessage, 'error', 8000);
        break;

      default:
        // Generic error
        userMessage = this.extractErrorMessage(error) || 'An unexpected error occurred. Please try again.';
        this.appState.showNotification(userMessage, 'error');
        break;
    }

    // Log error for debugging in development (but not for common GraphQL errors)
    if (!environment.production && !isGraphQLError) {
      console.group('🚨 HTTP Error Details');
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('URL:', req.url);
      console.error('Method:', req.method);
      console.error('Body:', req.body);
      console.error('Error Response:', error.error);
      console.groupEnd();
    }

    return throwError(() => error);
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    // Try to extract a meaningful error message from the response
    const errorResponse = error.error;
    
    if (typeof errorResponse === 'string') {
      return errorResponse;
    }
    
    if (errorResponse?.message) {
      return errorResponse.message;
    }
    
    if (errorResponse?.error?.message) {
      return errorResponse.error.message;
    }
    
    if (errorResponse?.errors && Array.isArray(errorResponse.errors) && errorResponse.errors.length > 0) {
      return errorResponse.errors[0].message || errorResponse.errors[0];
    }
    
    if (errorResponse?.detail) {
      return errorResponse.detail;
    }
    
    return null;
  }
}
