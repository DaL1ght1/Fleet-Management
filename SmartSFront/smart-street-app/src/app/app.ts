import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// Modern Angular Material components for beautiful UI
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

import { KeycloakService } from './core/services/keycloak.service';
import { RoleVisibilityService, MenuItemConfig, VisibilityRules } from './core/services/role-visibility.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatRippleModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private keycloakService = inject(KeycloakService);
  private roleVisibilityService = inject(RoleVisibilityService);
  protected translateService = inject(TranslateService);

  protected readonly title = 'Smart Street - Fleet Management';
  protected readonly isLoading = this.keycloakService.isLoading;
  protected readonly isAuthenticated = this.keycloakService.isAuthenticated;
  protected readonly userProfile = this.keycloakService.userProfile;
  protected readonly userDisplayName = computed(() => {
    const profile = this.userProfile();
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.username || profile?.email || 'User';
  });

  toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    root.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  }

  // Navigation items with role-based visibility
  protected readonly navItems: MenuItemConfig[] = [
    { label: 'Dashboard', key: 'dashboard', route: '/dashboard', icon: 'dashboard' }, // All users
    { label: 'Vehicles', key: 'vehicles', route: '/vehicles', icon: 'directions_car', visibilityConfig: VisibilityRules.STAFF_ONLY },
    { label: 'Trips', key: 'trips', route: '/trips', icon: 'map' }, // All users can view trips
    { label: 'Billing', key: 'billing', route: '/billing', icon: 'receipt', visibilityConfig: VisibilityRules.MANAGER_OR_ADMIN },
    { label: 'Geofences', key: 'geofences', route: '/geofences', icon: 'location_on', visibilityConfig: VisibilityRules.MANAGER_OR_ADMIN },
    { label: 'Maintenance', key: 'maintenance', route: '/maintenance', icon: 'build', visibilityConfig: VisibilityRules.STAFF_ONLY },
    { label: 'Notifications', key: 'notifications', route: '/notifications', icon: 'notifications' }, // All users
    { label: 'Drivers', key: 'drivers', route: '/drivers', icon: 'person_pin', visibilityConfig: VisibilityRules.MANAGER_OR_ADMIN },
    { label: 'Profile', key: 'profile', route: '/profile', icon: 'person' }, // All users
    { label: 'Admin', key: 'admin', route: '/admin', icon: 'admin_panel_settings', visibilityConfig: VisibilityRules.ADMIN_ONLY },
  ];

  // Computed navigation items based on user roles
  protected readonly visibleNavItems = computed(() => {
    return this.roleVisibilityService.getVisibleNavItems(this.navItems);
  });
  
  // User role information for display
  protected readonly userPrimaryRole = computed(() => {
    return this.roleVisibilityService.getPrimaryRole();
  });
  
  protected readonly userRoleDisplayNames = computed(() => {
    return this.roleVisibilityService.getUserRoleDisplayNames();
  });

  ngOnInit() {
    // Initialize translation service
    this.translateService.setDefaultLang('en');
    this.translateService.use('en');
  }

  changeLanguage(lang: string) {
    this.translateService.use(lang);
  }

  logout(): void {
    this.keycloakService.logout();
  }

  accountManagement(): void {
    this.keycloakService.accountManagement();
  }
}
