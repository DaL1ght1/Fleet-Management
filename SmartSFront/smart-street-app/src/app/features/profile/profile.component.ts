import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { KeycloakService } from '../../core/services/keycloak.service';
import { UserService } from '../../core/services/user.service';
import { RoleVisibilityService } from '../../core/services/role-visibility.service';
import { User, UpdateUserInput } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="profile-container">
      <div class="header-section">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="user-info">
              <h1>{{ displayName() }}</h1>
              <p>{{ userProfile()?.email }}</p>
              <div class="user-roles">
                <mat-chip *ngFor="let role of userRoleDisplayNames()" class="role-chip">
                  <mat-icon matChipAvatar>security</mat-icon>
                  {{ role }}
                </mat-chip>
              </div>
              <div class="role-badge">
                <mat-chip class="primary-role-chip">
                  <mat-icon matChipAvatar>star</mat-icon>
                  {{ userPrimaryRole() || 'User' }}
                </mat-chip>
              </div>
            </div>
          </div>
          <div class="profile-actions">
            <button mat-raised-button class="secondary-action-btn" (click)="keycloakService.accountManagement()">
              <mat-icon>manage_accounts</mat-icon>
              {{ 'profile.security' | translate }}
            </button>
            <button mat-stroked-button class="logout-btn" (click)="keycloakService.logout()">
              <mat-icon>logout</mat-icon>
              {{ 'app.logout' | translate }}
            </button>
          </div>
        </div>
      </div>

      <mat-tab-group class="profile-tabs">
        <!-- Profile Information Tab -->
        <mat-tab [label]="'profile.personalInfo' | translate">
          <div class="tab-content">
            <mat-card class="info-card">
              <div class="card-header">
                <mat-icon class="header-icon personal-icon">person_outline</mat-icon>
                <div class="header-text">
                  <h3>{{ 'profile.personalInfo' | translate }}</h3>
                  <p>{{ 'profile.updateProfile' | translate }}</p>
                </div>
              </div>
              <mat-card-content>
                <div *ngIf="isLoadingProfile()" class="loading-content">
                  <mat-icon class="loading-icon">refresh</mat-icon>
                  <h3>{{ 'app.loading' | translate }}</h3>
                  <p>Loading profile information...</p>
                </div>

                <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" *ngIf="!isLoadingProfile()" class="profile-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>{{ 'profile.fields.firstName' | translate }} *</mat-label>
                      <input matInput formControlName="firstName">
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        {{ 'validation.required' | translate }}
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>{{ 'profile.fields.lastName' | translate }} *</mat-label>
                      <input matInput formControlName="lastName">
                      <mat-icon matSuffix>person</mat-icon>
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        {{ 'validation.required' | translate }}
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>{{ 'profile.fields.email' | translate }} *</mat-label>
                      <input matInput type="email" formControlName="email">
                      <mat-icon matSuffix>email</mat-icon>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                        {{ 'validation.required' | translate }}
                      </mat-error>
                      <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                        {{ 'validation.email' | translate }}
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="form-field">
                      <mat-label>{{ 'profile.fields.phone' | translate }}</mat-label>
                      <input matInput formControlName="phoneNumber" placeholder="+1 (555) 123-4567">
                      <mat-icon matSuffix>phone</mat-icon>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button type="submit" mat-raised-button class="primary-action-btn" 
                            [disabled]="profileForm.invalid || isUpdating()">
                      <mat-icon *ngIf="isUpdating()">
                        <mat-spinner diameter="20"></mat-spinner>
                      </mat-icon>
                      <mat-icon *ngIf="!isUpdating()">save</mat-icon>
                      {{ isUpdating() ? ('app.loading' | translate) : ('profile.updateProfile' | translate) }}
                    </button>
                    <button type="button" mat-stroked-button class="secondary-btn" (click)="resetForm()">
                      <mat-icon>refresh</mat-icon>
                      {{ 'app.reset' | translate }}
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Account Settings Tab -->
        <mat-tab [label]="'profile.accountDetails' | translate">
          <div class="tab-content">
            <mat-card class="info-card">
              <div class="card-header">
                <mat-icon class="header-icon account-icon">account_box</mat-icon>
                <div class="header-text">
                  <h3>{{ 'profile.accountDetails' | translate }}</h3>
                  <p>View your account information and status</p>
                </div>
              </div>
              <mat-card-content>
                <div class="account-details">
                  <div class="detail-item">
                    <div class="detail-icon">
                      <mat-icon>fingerprint</mat-icon>
                    </div>
                    <div class="detail-content">
                      <span class="label">User ID</span>
                      <span class="value">{{ userProfile()?.id || ('Not available' | translate) }}</span>
                    </div>
                  </div>
                  
                  <div class="detail-item">
                    <div class="detail-icon">
                      <mat-icon>person</mat-icon>
                    </div>
                    <div class="detail-content">
                      <span class="label">{{ 'admin.fields.username' | translate }}</span>
                      <span class="value">{{ userProfile()?.username || ('Not available' | translate) }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <mat-icon>email</mat-icon>
                    </div>
                    <div class="detail-content">
                      <span class="label">{{ 'profile.fields.email' | translate }}</span>
                      <span class="value">{{ userProfile()?.email || ('Not available' | translate) }}</span>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <mat-icon>security</mat-icon>
                    </div>
                    <div class="detail-content">
                      <span class="label">{{ 'admin.fields.role' | translate }}</span>
                      <div class="value">
                        <mat-chip *ngFor="let role of userRoleDisplayNames()" class="role-chip">
                          <mat-icon matChipAvatar>verified_user</mat-icon>
                          {{ role }}
                        </mat-chip>
                      </div>
                    </div>
                  </div>

                  <div class="detail-item">
                    <div class="detail-icon">
                      <mat-icon>verified_user</mat-icon>
                    </div>
                    <div class="detail-content">
                      <span class="label">{{ 'admin.fields.status' | translate }}</span>
                      <div class="value">
                        <mat-chip [class]="keycloakService.isAuthenticated() ? 'status-authenticated' : 'status-unauthenticated'">
                          <mat-icon matChipAvatar>{{ keycloakService.isAuthenticated() ? 'check_circle' : 'error' }}</mat-icon>
                          {{ keycloakService.isAuthenticated() ? ('Authenticated' | translate) : ('Not Authenticated' | translate) }}
                        </mat-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Account Actions -->
            <mat-card class="actions-card">
              <div class="card-header">
                <mat-icon class="header-icon actions-icon">settings</mat-icon>
                <div class="header-text">
                  <h3>Account Actions</h3>
                  <p>Manage your account settings and preferences</p>
                </div>
              </div>
              <mat-card-content>
                <div class="account-actions">
                  <button mat-raised-button class="primary-action-btn" (click)="keycloakService.accountManagement()">
                    <mat-icon>manage_accounts</mat-icon>
                    {{ 'profile.security' | translate }}
                  </button>
                  
                  <button mat-stroked-button class="secondary-btn" (click)="refreshProfile()">
                    <mat-icon>refresh</mat-icon>
                    {{ 'app.refresh' | translate }}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Security Tab -->
        <mat-tab [label]="'profile.security' | translate">
          <div class="tab-content">
            <mat-card class="security-card">
              <div class="card-header">
                <mat-icon class="header-icon security-icon">security</mat-icon>
                <div class="header-text">
                  <h3>{{ 'profile.security' | translate }}</h3>
                  <p>Manage your account security and authentication</p>
                </div>
              </div>
              <mat-card-content>
                <div class="security-content">
                  <div class="security-info">
                    <mat-icon class="security-shield">shield</mat-icon>
                    <div class="security-text">
                      <h4>Account Security</h4>
                      <p>Your account security is managed through our secure authentication system. Click below to access advanced security settings including password change, two-factor authentication, and session management.</p>
                    </div>
                  </div>
                  <div class="security-actions">
                    <button mat-raised-button class="primary-action-btn" (click)="keycloakService.accountManagement()">
                      <mat-icon>security</mat-icon>
                      {{ 'profile.security' | translate }}
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: var(--space-8);
      max-width: 1200px;
      margin: 0 auto;
      background-color: var(--color-background);
    }

    .header-section {
      margin-bottom: var(--space-8);
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: var(--space-8);
      border-radius: var(--radius-xl);
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: float 6s ease-in-out infinite;
      }

      .avatar-section {
        display: flex;
        align-items: center;
        gap: var(--space-8);
        position: relative;
        z-index: 2;

        .avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
          }

          mat-icon {
            font-size: 3rem;
            width: 3rem;
            height: 3rem;
            color: rgba(255, 255, 255, 0.9);
          }
        }

        .user-info {
          h1 {
            margin: 0 0 var(--space-2) 0;
            font-size: 2.5rem;
            font-weight: 700;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            line-height: 1.2;
          }

          p {
            margin: 0 0 var(--space-4) 0;
            font-size: 1.1rem;
            color: rgba(255, 255, 255, 0.85);
            font-weight: 500;
          }

          .user-roles {
            margin-bottom: var(--space-3);
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-2);
          }
          
          .role-badge {
            .primary-role-chip {
              background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 193, 7, 0.9) 100%);
              color: #333;
              font-weight: 600;
              border: 2px solid rgba(255, 235, 59, 0.5);
              font-size: 0.875rem;
              padding: 8px 12px;
              
              mat-icon {
                color: #FF6F00;
              }
            }
          }
        }
      }

      .profile-actions {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        position: relative;
        z-index: 2;

        .secondary-action-btn {
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-weight: 600;
          min-width: 200px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          
          mat-icon {
            margin-right: 8px;
          }
        }

        .logout-btn {
          background: transparent;
          border: 2px solid rgba(244, 67, 54, 0.7);
          color: #FFCDD2;
          font-weight: 600;
          min-width: 200px;
          transition: all 0.3s ease;
          
          &:hover {
            background: rgba(244, 67, 54, 0.2);
            border-color: #F44336;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
          }
          
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .profile-tabs {
      .mat-mdc-tab-group {
        --mdc-secondary-navigation-tab-container-height: 64px;
      }

      .mat-mdc-tab {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .tab-content {
      padding: var(--space-8) 0;
    }

    .info-card, .actions-card, .security-card {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
      overflow: hidden;
      margin-bottom: var(--space-6);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-8) var(--space-8) var(--space-6);
        border-bottom: 1px solid var(--color-border);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);

        .header-icon {
          width: 3rem;
          height: 3rem;
          font-size: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.personal-icon {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
            color: #2196F3;
          }
          
          &.account-icon {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
            color: #4CAF50;
          }
          
          &.actions-icon {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.2) 100%);
            color: #FF9800;
          }
          
          &.security-icon {
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.2) 100%);
            color: #9C27B0;
          }
        }

        .header-text {
          h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-text-primary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          p {
            margin: var(--space-1) 0 0 0;
            color: var(--color-text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
          }
        }
      }

      mat-card-content {
        padding: var(--space-8) !important;
      }
    }

    .loading-content {
      text-align: center;
      padding: var(--space-12) var(--space-8);
      
      .loading-icon {
        font-size: 3rem;
        width: 3rem;
        height: 3rem;
        margin-bottom: var(--space-6);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: spin 1s linear infinite;
      }
      
      h3 {
        margin: 0 0 var(--space-2) 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      
      p {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: 1rem;
      }
    }

    .profile-form {
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-6);
        margin-bottom: var(--space-6);
      }

      .form-field {
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
        }
      }

      .form-actions {
        display: flex;
        gap: var(--space-4);
        justify-content: flex-end;
        margin-top: var(--space-8);
        padding-top: var(--space-6);
        border-top: 2px solid var(--color-border);
      }
    }

    .account-details {
      .detail-item {
        display: flex;
        align-items: flex-start;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
        padding: var(--space-4);
        border-radius: var(--radius-lg);
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--color-surface-hover);
          transform: translateX(4px);
        }
        
        &:last-child {
          margin-bottom: 0;
        }

        .detail-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          
          mat-icon {
            color: var(--color-text-secondary);
            font-size: 1.25rem;
            width: 1.25rem;
            height: 1.25rem;
          }
        }

        .detail-content {
          flex: 1;
          
          .label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--space-1);
          }
          
          .value {
            display: block;
            font-size: 1rem;
            font-weight: 500;
            color: var(--color-text-primary);
            line-height: 1.5;
          }
        }
      }
    }

    .account-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      align-items: flex-start;
    }

    .security-content {
      .security-info {
        display: flex;
        align-items: flex-start;
        gap: var(--space-6);
        margin-bottom: var(--space-8);
        padding: var(--space-6);
        background: linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0.1) 100%);
        border-radius: var(--radius-lg);
        border: 1px solid rgba(156, 39, 176, 0.1);

        .security-shield {
          font-size: 3rem;
          width: 3rem;
          height: 3rem;
          color: #9C27B0;
          flex-shrink: 0;
        }

        .security-text {
          h4 {
            margin: 0 0 var(--space-3) 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--color-text-primary);
          }
          
          p {
            margin: 0;
            color: var(--color-text-secondary);
            line-height: 1.6;
          }
        }
      }

      .security-actions {
        text-align: center;
      }
    }

    // Button Styles
    .primary-action-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }
      
      &:disabled {
        opacity: 0.6;
        transform: none;
        cursor: not-allowed;
      }
      
      mat-icon {
        margin-right: 8px;
      }
    }

    .secondary-btn {
      border: 2px solid var(--color-border);
      color: var(--color-text-primary);
      background: transparent;
      font-weight: 600;
      padding: 10px 22px;
      border-radius: var(--radius-lg);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #667eea;
        color: #667eea;
        background: rgba(102, 126, 234, 0.05);
        transform: translateY(-1px);
      }
      
      mat-icon {
        margin-right: 8px;
      }
    }

    // Chip Styles
    .role-chip {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.2) 100%);
      color: #1565C0;
      border: 1px solid rgba(33, 150, 243, 0.3);
      font-weight: 600;
      font-size: 0.8rem;
      
      mat-icon {
        color: #2196F3;
      }
    }

    .status-authenticated {
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
      color: #2E7D32;
      border: 1px solid rgba(76, 175, 80, 0.3);
      font-weight: 600;
      
      mat-icon {
        color: #4CAF50;
      }
    }

    .status-unauthenticated {
      background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
      color: #C62828;
      border: 1px solid rgba(244, 67, 54, 0.3);
      font-weight: 600;
      
      mat-icon {
        color: #F44336;
      }
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(-20px, -20px) rotate(180deg); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    // Responsive Design
    @media (max-width: 768px) {
      .profile-container {
        padding: var(--space-4);
      }

      .profile-header {
        flex-direction: column;
        gap: var(--space-6);
        text-align: center;
        
        &::before {
          top: -25%;
          right: -25%;
        }

        .avatar-section {
          flex-direction: column;
          text-align: center;
          gap: var(--space-6);
        }

        .profile-actions {
          width: 100%;
          
          .secondary-action-btn,
          .logout-btn {
            width: 100%;
            min-width: unset;
          }
        }
      }

      .profile-form {
        .form-row {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .form-actions {
          flex-direction: column;
          align-items: stretch;
          
          button {
            width: 100%;
          }
        }
      }

      .account-actions {
        width: 100%;
        
        button {
          width: 100%;
        }
      }

      .security-content {
        .security-info {
          flex-direction: column;
          text-align: center;
          
          .security-shield {
            align-self: center;
          }
        }
      }

      .card-header {
        flex-direction: column;
        text-align: center;
        gap: var(--space-3) !important;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  protected keycloakService = inject(KeycloakService);
  private userService = inject(UserService);
  private roleVisibilityService = inject(RoleVisibilityService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);

  protected userProfile = this.keycloakService.userProfile;
  protected userPrimaryRole = computed(() => this.roleVisibilityService.getPrimaryRole());
  protected userRoleDisplayNames = computed(() => this.roleVisibilityService.getUserRoleDisplayNames());
  protected isLoadingProfile = signal(false);
  protected isUpdating = signal(false);

  protected profileForm: FormGroup;
  protected currentUser = signal<User | null>(null);

  protected displayName = computed(() => {
    const profile = this.userProfile();
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.username || profile?.email || 'User';
  });

  protected userRoles = computed(() => {
    return this.keycloakService.getFilteredRoles();
  });

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['']
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  private async loadUserProfile(): Promise<void> {
    this.isLoadingProfile.set(true);
    
    try {
      const userId = this.keycloakService.getUserId();
      if (userId) {
        const user = await this.userService.loadUser(userId);
        if (user) {
          this.currentUser.set(user);
          this.populateForm(user);
        }
      } else {
        // Use Keycloak profile data if no backend user found
        this.populateFormFromKeycloak();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to Keycloak data
      this.populateFormFromKeycloak();
    } finally {
      this.isLoadingProfile.set(false);
    }
  }

  private populateForm(user: User): void {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber
    });
  }

  private populateFormFromKeycloak(): void {
    const profile = this.userProfile();
    if (profile) {
      this.profileForm.patchValue({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: '' // Keycloak profile might not have phone
      });
    }
  }

  protected async updateProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isUpdating.set(true);

    try {
      const formData = this.profileForm.value;
      const userId = this.keycloakService.getUserId();
      
      if (userId && this.currentUser()) {
        // Update via backend API
        const updateInput: UpdateUserInput = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        };
        
        await this.userService.updateUser(userId, updateInput);
        const message = await this.translateService.get('profile.messages.updateSuccess').toPromise();
        const closeText = await this.translateService.get('app.close').toPromise();
        this.snackBar.open(message, closeText, { duration: 3000 });
      } else {
        // Show message about Keycloak account management
        const message = await this.translateService.get('profile.messages.updateError').toPromise();
        const actionText = await this.translateService.get('profile.security').toPromise();
        this.snackBar.open(
          message,
          actionText,
          { 
            duration: 6000
          }
        ).onAction().subscribe(() => {
          this.keycloakService.accountManagement();
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = await this.translateService.get('profile.messages.updateError').toPromise();
      const closeText = await this.translateService.get('app.close').toPromise();
      this.snackBar.open(errorMessage, closeText, { duration: 5000 });
    } finally {
      this.isUpdating.set(false);
    }
  }

  protected resetForm(): void {
    if (this.currentUser()) {
      this.populateForm(this.currentUser()!);
    } else {
      this.populateFormFromKeycloak();
    }
    this.profileForm.markAsUntouched();
  }

  protected async refreshProfile(): Promise<void> {
    await this.loadUserProfile();
    const message = await this.translateService.get('app.refresh').toPromise();
    const closeText = await this.translateService.get('app.close').toPromise();
    this.snackBar.open(message, closeText, { duration: 2000 });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }
}
