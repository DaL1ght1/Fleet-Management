import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideApollo } from 'apollo-angular';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { KeycloakService } from './core/services/keycloak.service';
import { createApollo } from './core/services/apollo.config';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { initializeUserSync } from './core/initializers/user-sync.initializer';

// Factory function for TranslateHttpLoader
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


export function keycloakInitializer(keycloak: KeycloakService) {
  return () => keycloak.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Core providers only to test circular dependency
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    
    // Try with real animations - test if circular dependency is resolved
    provideAnimations(),
    
    // Translation module with HTTP loader (standard approach)
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),
    
    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    
    // Apollo GraphQL - depends on HTTP client
    provideApollo(createApollo),
    
    // Keycloak initialization
    {
      provide: APP_INITIALIZER,
      useFactory: keycloakInitializer,
      deps: [KeycloakService],
      multi: true,
    },
    
    // User synchronization setup (after Keycloak)
    {
      provide: APP_INITIALIZER,
      useFactory: initializeUserSync,
      multi: true,
    },
  ]
};
