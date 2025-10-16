import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { DriverService, Driver } from '../../../services/driver.service';
import { RoleVisibilityService, VisibilityRules } from '../../../core/services/role-visibility.service';

@Component({
  selector: 'app-driver-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslateModule
  ],
  template: `
    <div class="driver-detail-container" *ngIf="driver">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-nav">
          <button mat-icon-button class="back-button" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="breadcrumb">
            <span class="breadcrumb-item">{{ 'drivers.title' | translate }}</span>
            <mat-icon>chevron_right</mat-icon>
            <span class="breadcrumb-current">{{ driver.firstName }} {{ driver.lastName }}</span>
          </div>
        </div>
        
        <div class="header-actions" 
             *ngIf="roleVisibilityService.isVisible(editDriverVisibility)">
          <button mat-raised-button class="primary-action-btn" 
                  (click)="editDriver()">
            <mat-icon>edit</mat-icon>
            {{ 'drivers.actions.edit' | translate }}
          </button>
        </div>
      </div>

      <!-- Driver Profile Card -->
      <mat-card class="driver-profile-card">
        <div class="profile-header">
          <div class="driver-avatar">
            <mat-icon>person</mat-icon>
          </div>
          <div class="profile-info">
            <h1 class="driver-name">{{ driver.firstName }} {{ driver.lastName }}</h1>
            <div class="driver-chips">
              <mat-chip [class]="'status-' + driver.status.toLowerCase()">
                <mat-icon matChipAvatar>{{ getStatusIcon(driver.status) }}</mat-icon>
                {{ getStatusLabel(driver.status) | translate }}
              </mat-chip>
              
              <mat-chip [class]="'availability-' + getAvailabilityStatus(driver).toLowerCase()">
                <mat-icon matChipAvatar>{{ getAvailabilityIcon(driver) }}</mat-icon>
                {{ getAvailabilityLabel(driver) | translate }}
              </mat-chip>
              
              <mat-chip *ngIf="driver.rating" class="rating-chip">
                <mat-icon matChipAvatar>star</mat-icon>
                {{ driver.rating | number:'1.1-1' }}/5.0
              </mat-chip>
            </div>
          </div>
        </div>
      </mat-card>

      <!-- Information Grid -->
      <div class="info-grid">
        <!-- Contact Information -->
        <mat-card class="info-card">
          <div class="card-header">
            <mat-icon class="header-icon contact-icon">contact_phone</mat-icon>
            <h3>{{ 'drivers.detail.contactInfo' | translate }}</h3>
          </div>
          <mat-card-content>
            <div class="info-item">
              <mat-icon>email</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.email' | translate }}</span>
                <span class="value">{{ driver.email || ('common.notProvided' | translate) }}</span>
              </div>
            </div>
            
            <div class="info-item" *ngIf="driver.phone">
              <mat-icon>phone</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.phone' | translate }}</span>
                <span class="value">{{ driver.phone || ('common.notProvided' | translate) }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- License Information -->
        <mat-card class="info-card">
          <div class="card-header">
            <mat-icon class="header-icon license-icon">credit_card</mat-icon>
            <h3>{{ 'drivers.detail.licenseInfo' | translate }}</h3>
          </div>
          <mat-card-content>
            <div class="info-item" *ngIf="driver.licenseNumber">
              <mat-icon>confirmation_number</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.licenseNumber' | translate }}</span>
                <span class="value license-number">{{ driver.licenseNumber }}</span>
              </div>
            </div>
            
            <div class="info-item" *ngIf="driver.licenseExpiryDate">
              <mat-icon>event</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.licenseExpiry' | translate }}</span>
                <span class="value" [class.expiring]="isLicenseExpiring(driver.licenseExpiryDate)">
                  {{ driver.licenseExpiryDate | date:'mediumDate' }}
                </span>
              </div>
              <mat-icon *ngIf="isLicenseExpiring(driver.licenseExpiryDate)" 
                       class="warning-icon">warning</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Emergency Contact -->
        <mat-card class="info-card" *ngIf="driver.emergencyContactName || driver.emergencyContactPhone">
          <div class="card-header">
            <mat-icon class="header-icon emergency-icon">emergency</mat-icon>
            <h3>{{ 'drivers.detail.emergencyContact' | translate }}</h3>
          </div>
          <mat-card-content>
            <div class="info-item" *ngIf="driver.emergencyContactName">
              <mat-icon>person</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.emergencyContactName' | translate }}</span>
                <span class="value">{{ driver.emergencyContactName }}</span>
              </div>
            </div>
            
            <div class="info-item" *ngIf="driver.emergencyContactPhone">
              <mat-icon>phone</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.emergencyContactPhone' | translate }}</span>
                <span class="value">{{ driver.emergencyContactPhone }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Personal Information -->
        <mat-card class="info-card" *ngIf="driver.dateOfBirth || driver.hireDate">
          <div class="card-header">
            <mat-icon class="header-icon personal-icon">person_outline</mat-icon>
            <h3>{{ 'drivers.detail.personalInfo' | translate }}</h3>
          </div>
          <mat-card-content>
            <div class="info-item" *ngIf="driver.dateOfBirth">
              <mat-icon>cake</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.form.dateOfBirth' | translate }}</span>
                <span class="value">{{ driver.dateOfBirth | date:'mediumDate' }}</span>
              </div>
            </div>
            
            <div class="info-item" *ngIf="driver.hireDate">
              <mat-icon>work</mat-icon>
              <div class="item-content">
                <span class="label">{{ 'drivers.detail.hireDate' | translate }}</span>
                <span class="value">{{ driver.hireDate | date:'mediumDate' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Current Trip Card -->
      <mat-card *ngIf="driver.currentTripId" class="current-trip-card">
        <div class="card-header active-trip">
          <mat-icon class="header-icon trip-icon">directions_car</mat-icon>
          <h3>{{ 'drivers.detail.currentTrip' | translate }}</h3>
          <mat-chip class="active-chip">
            <mat-icon matChipAvatar>play_circle_filled</mat-icon>
            Active
          </mat-chip>
        </div>
        
        <mat-card-content>
          <div class="trip-info">
            <div class="trip-detail">
              <mat-icon>location_on</mat-icon>
              <div class="detail-content">
                <span class="label">{{ 'drivers.detail.tripId' | translate }}</span>
                <span class="value">{{ driver.currentTripId }}</span>
              </div>
            </div>
          </div>
          
          <div class="trip-actions">
            <button mat-raised-button class="secondary-action-btn" (click)="viewTrip(driver.currentTripId!)">
              <mat-icon>visibility</mat-icon>
              {{ 'drivers.actions.viewTrip' | translate }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
    
    <!-- Loading State -->
    <div *ngIf="!driver && isLoading" class="loading-container">
      <div class="loading-content">
        <mat-icon class="loading-icon">refresh</mat-icon>
        <h3>{{ 'common.loading' | translate }}</h3>
        <p>Loading driver information...</p>
      </div>
    </div>
    
    <!-- Error State -->
    <div *ngIf="!driver && !isLoading" class="error-container">
      <div class="error-content">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>{{ 'drivers.messages.notFound' | translate }}</h3>
        <p>The requested driver could not be found.</p>
        <button mat-raised-button class="secondary-action-btn" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          {{ 'common.goBack' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .driver-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-8);
      background-color: var(--color-background);
    }
    
    .header-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--space-8);
      margin: calc(-1 * var(--space-8)) calc(-1 * var(--space-8)) var(--space-12);
      border-radius: 0 0 24px 24px;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-6);
    }
    
    .header-nav {
      display: flex;
      align-items: center;
      gap: var(--space-6);
    }
    
    .back-button {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 50%;
      
      &:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
    
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      
      .breadcrumb-item {
        color: rgba(255, 255, 255, 0.7);
      }
      
      .breadcrumb-current {
        font-weight: 600;
      }
      
      mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        opacity: 0.7;
      }
    }
    
    .header-actions {
      .primary-action-btn {
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.3);
        color: white;
        font-weight: 600;
        padding: 10px 20px;
        border-radius: 12px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }
    
    .driver-profile-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      margin-bottom: var(--space-12);
      overflow: hidden;
      
      .profile-header {
        display: flex;
        align-items: center;
        gap: var(--space-8);
        padding: var(--space-12);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        border-bottom: 1px solid var(--color-border);
      }
      
      .driver-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        
        mat-icon {
          font-size: 2.5rem;
          width: 2.5rem;
          height: 2.5rem;
        }
      }
      
      .profile-info {
        flex: 1;
        
        .driver-name {
          margin: 0 0 var(--space-6) 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .driver-chips {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
      }
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--space-8);
    }
    
    .info-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s ease;
      overflow: hidden;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .card-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-8) var(--space-8) var(--space-6);
        border-bottom: 1px solid var(--color-border);
        
        .header-icon {
          width: 2rem;
          height: 2rem;
          font-size: 2rem;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.contact-icon {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
            color: #2196F3;
          }
          
          &.license-icon {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
            color: #4CAF50;
          }
          
          &.emergency-icon {
            background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
            color: #F44336;
          }
          
          &.personal-icon {
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.2) 100%);
            color: #9C27B0;
          }
          
          &.trip-icon {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.2) 100%);
            color: #FF9800;
          }
        }
        
        h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        &.active-trip {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
          
          .active-chip {
            margin-left: auto;
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.3) 100%);
            color: #2E7D32;
            border: 1px solid rgba(76, 175, 80, 0.3);
            font-size: 0.75rem;
            font-weight: 600;
          }
        }
      }
      
      mat-card-content {
        padding: var(--space-8) !important;
      }
      
      .info-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
        padding: var(--space-3);
        border-radius: var(--radius-md);
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--color-surface-hover);
        }
        
        &:last-child {
          margin-bottom: 0;
        }
        
        mat-icon {
          color: var(--color-text-secondary);
          width: 1.25rem;
          height: 1.25rem;
          font-size: 1.25rem;
          margin-top: 2px;
        }
        
        .item-content {
          flex: 1;
          
          .label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
          }
          
          .value {
            display: block;
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-text-primary);
            
            &.license-number {
              font-family: 'Roboto Mono', monospace;
              background: var(--color-surface-hover);
              padding: 4px 8px;
              border-radius: var(--radius-md);
              display: inline-block;
            }
            
            &.expiring {
              color: #FF5722;
              font-weight: 700;
            }
          }
        }
        
        .warning-icon {
          color: #FF5722;
          margin-left: var(--space-3);
          animation: pulse 2s infinite;
        }
      }
    }
    
    .current-trip-card {
      margin-top: var(--space-12);
      border: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(135deg, #4CAF50 0%, #45A049 100%) border-box;
      
      .trip-info {
        margin-bottom: var(--space-8);
        
        .trip-detail {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          
          mat-icon {
            color: #4CAF50;
            margin-top: 2px;
          }
          
          .detail-content {
            .label {
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: var(--color-text-secondary);
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 2px;
            }
            
            .value {
              display: block;
              font-size: 1.1rem;
              font-weight: 700;
              color: var(--color-text-primary);
              font-family: 'Roboto Mono', monospace;
            }
          }
        }
      }
      
      .trip-actions {
        display: flex;
        gap: var(--space-3);
      }
    }
    
    // Status and availability chips
    mat-chip {
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.8rem;
      padding: 6px 12px;
      border: 2px solid transparent;
      
      &.status-active {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
        color: #2E7D32;
        border-color: rgba(76, 175, 80, 0.3);
        
        mat-icon {
          color: #4CAF50;
        }
      }
      
      &.status-inactive {
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
        color: #C62828;
        border-color: rgba(244, 67, 54, 0.3);
        
        mat-icon {
          color: #F44336;
        }
      }
      
      &.availability-available {
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
        color: #1565C0;
        border-color: rgba(33, 150, 243, 0.3);
        
        mat-icon {
          color: #2196F3;
        }
      }
      
      &.availability-busy {
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.2) 100%);
        color: #E65100;
        border-color: rgba(255, 152, 0, 0.3);
        
        mat-icon {
          color: #FF9800;
        }
      }
      
      &.availability-offline {
        background: linear-gradient(135deg, rgba(158, 158, 158, 0.1) 0%, rgba(158, 158, 158, 0.2) 100%);
        color: #424242;
        border-color: rgba(158, 158, 158, 0.3);
        
        mat-icon {
          color: #9E9E9E;
        }
      }
      
      &.rating-chip {
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.2) 100%);
        color: #F57F17;
        border-color: rgba(255, 193, 7, 0.3);
        
        mat-icon {
          color: #FFC107;
        }
      }
    }
    
    .secondary-action-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-weight: 600;
      border-radius: var(--radius-md);
      padding: 10px 20px;
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
      }
      
      mat-icon {
        margin-right: 8px;
      }
    }
    
    .loading-container, .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      padding: var(--space-12);
    }
    
    .loading-content, .error-content {
      text-align: center;
      max-width: 400px;
      
      .loading-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: var(--space-8);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: spin 1s linear infinite;
      }
      
      .error-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        margin-bottom: var(--space-8);
        color: #F44336;
      }
      
      h3 {
        margin: 0 0 var(--space-3) 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0 0 var(--space-8) 0;
        color: var(--color-text-secondary);
        font-size: 1rem;
        line-height: 1.5;
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @media (max-width: 768px) {
      .driver-detail-container {
        padding: var(--space-6);
      }
      
      .header-section {
        margin: calc(-1 * var(--space-6)) calc(-1 * var(--space-6)) var(--space-8);
        padding: var(--space-8) var(--space-6);
        flex-direction: column;
        align-items: stretch;
        
        .header-nav {
          justify-content: flex-start;
          
          .breadcrumb {
            flex-wrap: wrap;
          }
        }
        
        .header-actions {
          margin-top: var(--space-6);
          align-self: flex-end;
        }
      }
      
      .driver-profile-card {
        .profile-header {
          flex-direction: column;
          text-align: center;
          
          .driver-avatar {
            align-self: center;
          }
          
          .driver-chips {
            justify-content: center;
          }
        }
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }
    }
  `]
})
export class DriverDetailComponent implements OnInit {
  private driverService = inject(DriverService);
  protected roleVisibilityService = inject(RoleVisibilityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  
  driver: Driver | null = null;
  isLoading = false;
  
  // Role visibility configurations
  protected editDriverVisibility = VisibilityRules.MANAGER_OR_ADMIN;
  
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadDriver(id);
    }
  }
  
  private async loadDriver(id: string): Promise<void> {
    this.isLoading = true;
    
    try {
      this.driver = (await this.driverService.getDriver(id).toPromise()) || null;
    } catch (error) {
      console.error('Error loading driver:', error);
      this.snackBar.open(
        this.translate.instant('drivers.messages.loadError'),
        'Close',
        { duration: 5000 }
      );
    } finally {
      this.isLoading = false;
    }
  }
  
  goBack(): void {
    this.router.navigate(['/drivers']);
  }
  
  editDriver(): void {
    if (this.driver) {
      this.router.navigate(['/drivers', this.driver.id, 'edit']);
    }
  }
  
  viewTrip(tripId: string): void {
    this.router.navigate(['/trips', tripId]);
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'primary';
      case 'INACTIVE': return '';
      case 'SUSPENDED': return 'warn';
      case 'ON_LEAVE': return 'accent';
      default: return '';
    }
  }
  
  getStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'person';
      case 'INACTIVE': return 'person_off';
      case 'SUSPENDED': return 'block';
      case 'ON_LEAVE': return 'vacation_rental';
      default: return 'help';
    }
  }
  
  getStatusLabel(status: string): string {
    return `drivers.status.${status.toLowerCase()}`;
  }
  
  getAvailabilityColor(driver: Driver): string {
    const status = this.getAvailabilityStatus(driver);
    switch (status) {
      case 'available': return 'primary';
      case 'busy': return 'accent';
      case 'offline': return '';
      default: return '';
    }
  }
  
  getAvailabilityIcon(driver: Driver): string {
    const status = this.getAvailabilityStatus(driver);
    switch (status) {
      case 'available': return 'check_circle';
      case 'busy': return 'directions_car';
      case 'offline': return 'offline_bolt';
      default: return 'help';
    }
  }
  
  getAvailabilityLabel(driver: Driver): string {
    const status = this.getAvailabilityStatus(driver);
    return `drivers.availability.${status}`;
  }
  
  getAvailabilityStatus(driver: Driver): string {
    if (driver.status !== 'ACTIVE') return 'offline';
    return driver.currentTripId ? 'busy' : 'available';
  }

  private getAvailabilityStatusPrivate(driver: Driver): string {
    return this.getAvailabilityStatus(driver);
  }
  
  isLicenseExpiring(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return expiry <= thirtyDaysFromNow;
  }
}