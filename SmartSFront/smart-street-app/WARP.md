# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Smart Street App is a modern Angular 18+ fleet management application that uses:
- **Angular 18** with standalone components (no NgModules)
- **Angular Signals** for reactive state management
- **GraphQL** with Apollo Client for API communication
- **Angular Material** for UI components
- **Keycloak** for authentication and authorization
- **Role-based access control** with route guards
- **Multi-language support** with ngx-translate

## Development Commands

### Primary Commands
- `npm start` - Start development server (http://localhost:4200)
- `npm run build` - Build for development
- `npm run build:prod` - Build for production
- `npm test` - Run unit tests with Karma
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

### Code Quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run analyze` - Analyze bundle size

### GraphQL
- `npm run codegen` - Generate GraphQL types and services
- `npm run codegen:watch` - Generate GraphQL types in watch mode

**Note**: GraphQL codegen expects a GraphQL server at `http://localhost:4000/graphql`

## Architecture

### Project Structure
```
src/app/
├── core/                    # Core services, guards, interceptors
│   ├── guards/             # Auth and role guards
│   ├── interceptors/       # HTTP interceptors
│   ├── services/           # Core services (Keycloak, Apollo)
│   ├── state/              # Global state management
│   └── initializers/       # App initialization logic
├── features/               # Feature modules (lazy-loaded)
│   ├── dashboard/
│   ├── vehicles/
│   ├── trips/
│   ├── billing/
│   ├── geofences/
│   ├── maintenance/
│   ├── notifications/
│   ├── drivers/
│   ├── profile/
│   └── admin/
└── shared/                 # Shared components and services
    ├── components/         # Reusable UI components
    ├── pipes/              # Custom pipes
    └── services/           # Shared services
```

### Key Architectural Patterns

1. **Feature-First Organization**: Each feature has its own module with list/detail/form components
2. **Lazy Loading**: All feature routes are lazy-loaded for performance
3. **Role-Based Access**: Routes and UI elements are controlled by user roles (Admin, Manager, Staff, Driver)
4. **Signals-First**: Uses Angular Signals for reactive state instead of RxJS where possible
5. **Standalone Components**: No NgModules, all components are standalone
6. **GraphQL Integration**: Uses Apollo Angular with code generation for type safety

### Authentication & Authorization

- **Keycloak Integration**: Handles authentication and user management
- **Role Guards**: `authGuard` and `roleGuard` protect routes
- **Role Configurations**: `RoleConfig` defines access levels (ADMIN_ONLY, MANAGER_OR_ADMIN, STAFF_ONLY)
- **User Sync**: Automatic user profile synchronization on app initialization

### State Management

- **Signals**: Primary state management using Angular Signals
- **Computed Values**: Derived state with `computed()`
- **Services**: Injectable services for business logic and data access
- **Apollo Cache**: GraphQL cache for API data

## Development Guidelines

### Angular Best Practices
- Always use standalone components (default behavior)
- Use `input()` and `output()` functions instead of decorators
- Use signals for reactive state management
- Set `changeDetection: ChangeDetectionStrategy.OnPush` for all components
- Use native control flow (`@if`, `@for`, `@switch`) instead of structural directives
- Use `class` and `style` bindings instead of `ngClass`/`ngStyle`
- Use `inject()` function instead of constructor injection

### TypeScript Guidelines
- Strict type checking is enforced
- Avoid `any` type, use `unknown` when uncertain
- Prefer type inference when obvious
- Use proper return types for functions

### Component Guidelines
- Keep components focused on single responsibility
- Use computed values for derived state
- Prefer inline templates for small components
- Use Reactive Forms over Template-driven forms
- Use `NgOptimizedImage` for static images

### GraphQL Integration
- Run `npm run codegen` after schema changes
- Generated types are in `src/app/core/graphql/generated.ts`
- Apollo services are auto-generated with hooks
- GraphQL queries should be in `.graphql` files when possible

## Testing

- Unit tests use Jasmine and Karma
- Tests run in Chrome by default
- Use `npm test` for single run
- Test files should have `.spec.ts` extension

## Code Quality Tools

- **ESLint**: Angular-specific rules with TypeScript support
- **Prettier**: Code formatting with Angular template support
- **TypeScript**: Strict mode enabled for better type safety

## Common Tasks

### Adding New Features
1. Create feature directory under `src/app/features/`
2. Generate components: `ng generate component feature-name/component-name`
3. Create feature routes file
4. Add route to main `app.routes.ts`
5. Add role guards if needed

### Working with GraphQL
1. Add/modify GraphQL queries in feature directories
2. Run `npm run codegen` to update types
3. Use generated services in components
4. Handle loading and error states

### Internationalization
- Translation files in `src/assets/i18n/`
- Use `TranslateModule` and `TranslateService`
- Add new language files as `{lang}.json`

## Important Notes

- The app expects a GraphQL server at `http://localhost:4000/graphql`
- Keycloak configuration is required for authentication
- Role-based access control is strictly enforced
- All routes except `/map-test` require authentication
- Bundle size is monitored (1MB warning, 2MB error for initial bundle)