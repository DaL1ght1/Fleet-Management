export type AppRole = 'ADMIN' | 'MANAGER' | 'DRIVER' | 'USER';

export const Roles = {
  ADMIN: ['ADMIN'],
  MANAGEMENT: ['ADMIN', 'MANAGER'],
  STAFF: ['ADMIN', 'MANAGER', 'DRIVER'],
  EVERYONE: ['ADMIN', 'MANAGER', 'DRIVER', 'USER'],
} as const satisfies Record<string, readonly AppRole[]>;
