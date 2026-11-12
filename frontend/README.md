# SmartStreet web application

Angular 20 front end for SmartStreet: zoneless change detection, signals and `rxResource`, OnPush components, Angular Material 3, and Apollo Angular services generated from the federated supergraph.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Regenerates the GraphQL client and serves on http://localhost:4200 |
| `npm run codegen` | Regenerates `src/app/core/graphql/generated.ts` from the supergraph and the `*.graphql` operations |
| `npm run lint` | angular-eslint for TypeScript and templates |
| `npm run test:ci` | Unit tests in headless Chrome |
| `npm run build` | Production build |

## Structure

```
src/app
  core/        auth (Keycloak, role guard, *appHasRole), graphql, http interceptor, i18n, notifications
  shared/      ui building blocks, Leaflet map components, pipes, utilities
  features/    dashboard, trips, vehicles, drivers, customers, profile
               each with data-access/*.graphql and lazy-loaded pages
```

Operations live next to the feature in `data-access/*.graphql`. Codegen validates them against the composed supergraph and produces typed injectable services such as `TripsGQL` and `ScheduleTripGQL`.

Translations are in `src/assets/i18n` (en, fr, ar, es). A unit test fails when a locale misses a key or an interpolation placeholder, and Arabic switches the document to right-to-left.
