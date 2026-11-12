import { AppRole, Roles } from '../../core/auth/roles';

export interface NavigationItem {
  route: string;
  icon: string;
  labelKey: string;
  roles: readonly AppRole[];
}

export interface NavigationGroup {
  labelKey: string;
  items: readonly NavigationItem[];
}

export const NAVIGATION: readonly NavigationGroup[] = [
  {
    labelKey: 'navigation.groups.operations',
    items: [
      { route: '/dashboard', icon: 'space_dashboard', labelKey: 'navigation.dashboard', roles: Roles.STAFF },
      { route: '/fleet-map', icon: 'map', labelKey: 'navigation.fleetMap', roles: Roles.STAFF },
      { route: '/trips', icon: 'route', labelKey: 'navigation.trips', roles: Roles.STAFF },
      { route: '/geofences', icon: 'fence', labelKey: 'navigation.geofences', roles: Roles.STAFF },
    ],
  },
  {
    labelKey: 'navigation.groups.fleet',
    items: [
      { route: '/vehicles', icon: 'directions_car', labelKey: 'navigation.vehicles', roles: Roles.STAFF },
      { route: '/maintenance', icon: 'build', labelKey: 'navigation.maintenance', roles: Roles.MANAGEMENT },
      { route: '/drivers', icon: 'badge', labelKey: 'navigation.drivers', roles: Roles.MANAGEMENT },
    ],
  },
  {
    labelKey: 'navigation.groups.business',
    items: [
      { route: '/customers', icon: 'groups', labelKey: 'navigation.customers', roles: Roles.MANAGEMENT },
      { route: '/billing', icon: 'receipt_long', labelKey: 'navigation.billing', roles: Roles.MANAGEMENT },
    ],
  },
  {
    labelKey: 'navigation.groups.mine',
    items: [
      { route: '/my/trips/new', icon: 'add_road', labelKey: 'navigation.bookTrip', roles: ['USER'] },
      { route: '/my/trips', icon: 'luggage', labelKey: 'navigation.myTrips', roles: ['DRIVER', 'USER'] },
      { route: '/my/invoices', icon: 'request_quote', labelKey: 'navigation.myInvoices', roles: ['USER'] },
      { route: '/notifications', icon: 'notifications', labelKey: 'navigation.notifications', roles: Roles.EVERYONE },
    ],
  },
];
