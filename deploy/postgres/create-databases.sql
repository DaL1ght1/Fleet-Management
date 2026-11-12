SELECT format('CREATE DATABASE %I', name)
FROM unnest(ARRAY['keycloak', 'identity', 'users', 'vehicle', 'trips', 'telemetry', 'geofence', 'maintenance',
                  'billing', 'notifications']) AS name
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = name)
\gexec
