import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, Status, FuelType } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    TranslateModule,
  ],
  template: `
    <div class="vehicle-detail-container">
      <div *ngIf="isLoading()" class="loading-content">
        <mat-spinner></mat-spinner>
        <p>{{ 'app.loading' | translate }}</p>
      </div>

      <div *ngIf="error()" class="error-content">
        <mat-icon>error</mat-icon>
        <h3>{{ 'vehicles.messages.loadError' | translate }}</h3>
        <p>{{ error() }}</p>
        <button mat-raised-button color="primary" (click)="loadVehicleDetails()">
          <mat-icon>refresh</mat-icon>
          {{ 'app.refresh' | translate }}
        </button>
      </div>

      <div *ngIf="vehicle() && !isLoading()" class="content">
        <!-- Header Section -->
        <div class="header-section">
          <div class="vehicle-title">
            <h1>{{ vehicle()?.year }} {{ vehicle()?.make }} {{ vehicle()?.model }}</h1>
            <div class="subtitle">
              <span class="license-plate">{{ vehicle()?.licensePlate }}</span>
              <mat-chip-set>
                <mat-chip [color]="getStatusColor(vehicle()?.status!)">
                  {{ vehicle()?.status }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>

          <div class="actions">
            <button mat-stroked-button routerLink="/vehicles">
              <mat-icon>arrow_back</mat-icon>
              {{ 'app.back' | translate }}
            </button>
            <button mat-raised-button color="primary" [routerLink]="['/vehicles', vehicle()?.id, 'edit']">
              <mat-icon>edit</mat-icon>
              {{ 'vehicles.editVehicle' | translate }}
            </button>
          </div>
        </div>

        <mat-tab-group>
          <!-- Overview Tab -->
          <mat-tab [label]="'dashboard.subtitle' | translate">
            <div class="tab-content">
              <div class="overview-grid">
                <!-- Basic Information Card -->
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'vehicles.basicInfo' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <mat-icon matListItemIcon>directions_car</mat-icon>
                        <div matListItemTitle>{{ 'vehicles.fields.make' | translate }} & {{ 'vehicles.fields.model' | translate }}</div>
                        <div matListItemLine>{{ vehicle()?.year }} {{ vehicle()?.make }} {{ vehicle()?.model }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>palette</mat-icon>
                        <div matListItemTitle>{{ 'vehicles.fields.color' | translate }}</div>
                        <div matListItemLine>{{ vehicle()?.color }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>confirmation_number</mat-icon>
                        <div matListItemTitle>{{ 'vehicles.fields.vin' | translate }}</div>
                        <div matListItemLine>{{ vehicle()?.vin }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>local_gas_station</mat-icon>
                        <div matListItemTitle>{{ 'vehicles.fields.fuelType' | translate }}</div>
                        <div matListItemLine>{{ getFuelTypeDisplay(vehicle()?.fuelType!) }}</div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Specifications Card -->
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'vehicles.specifications' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <mat-icon matListItemIcon>airline_seat_recline_normal</mat-icon>
                        <div matListItemTitle>{{ 'vehicles.fields.seatingCapacity' | translate }}</div>
                        <div matListItemLine>{{ vehicle()?.seatingCapacity }} passengers</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>speed</mat-icon>
                        <div matListItemTitle>{{ 'vehicles.fields.mileage' | translate }}</div>
                        <div matListItemLine>{{ vehicle()?.mileage | number }} miles</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>gps_fixed</mat-icon>
                        <div matListItemTitle>GPS {{ 'app.view' | translate }}</div>
                        <div matListItemLine>
                          <mat-icon [style.color]="vehicle()?.gpsEnabled ? '#4caf50' : '#f44336'">
                            {{ vehicle()?.gpsEnabled ? 'check_circle' : 'cancel' }}
                          </mat-icon>
                          {{ vehicle()?.gpsEnabled ? 'Yes' : 'No' }}
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Financial Information Card -->
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'billing.invoice' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <mat-icon matListItemIcon>attach_money</mat-icon>
                        <div matListItemTitle>Daily Rental Rate</div>
                        <div matListItemLine>{{ vehicle()?.rentalPricePerDay! | currency }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>calculate</mat-icon>
                        <div matListItemTitle>Weekly Rate</div>
                        <div matListItemLine>{{ (vehicle()?.rentalPricePerDay! * 7 ) | currency }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>calendar_month</mat-icon>
                        <div matListItemTitle>Monthly Rate</div>
                        <div matListItemLine>{{ (vehicle()?.rentalPricePerDay! * 30 ) | currency }}</div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Maintenance Information Card -->
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'vehicles.maintenance' | translate }}</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <mat-icon matListItemIcon>build</mat-icon>
                        <div matListItemTitle>Last Maintenance</div>
                        <div matListItemLine>{{ vehicle()?.lastMaintenanceDate | date:'mediumDate' }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>schedule</mat-icon>
                        <div matListItemTitle>Next Maintenance</div>
                        <div matListItemLine>{{ vehicle()?.nextMaintenanceDate | date:'mediumDate' }}</div>
                      </mat-list-item>
                      <mat-list-item>
                        <mat-icon matListItemIcon>timer</mat-icon>
                        <div matListItemTitle>Maintenance Interval</div>
                        <div matListItemLine>{{ vehicle()?.maintenanceIntervalDays }} days</div>
                      </mat-list-item>
                      <mat-list-item>
                        <div matListItemTitle>Status</div>
                        <div matListItemLine>
                          <mat-chip-set>
                            <mat-chip [color]="getMaintenanceStatusColor()">
                              {{ getMaintenanceStatus() }}
                            </mat-chip>
                          </mat-chip-set>
                        </div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- History Tab -->
          <mat-tab label="History">
            <div class="tab-content">
              <!-- History Statistics -->
              <div class="history-stats-grid">
                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon trips-icon">map</mat-icon>
                      <div class="stat-details">
                        <div class="stat-value">{{ getHistoryStats().totalTrips }}</div>
                        <div class="stat-label">Total Trips</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon distance-icon">straighten</mat-icon>
                      <div class="stat-details">
                        <div class="stat-value">{{ getHistoryStats().totalDistance | number:'1.0-0' }}</div>
                        <div class="stat-label">Miles Driven</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon maintenance-icon">build</mat-icon>
                      <div class="stat-details">
                        <div class="stat-value">{{ getHistoryStats().maintenanceEvents }}</div>
                        <div class="stat-label">Maintenance Events</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-content">
                      <mat-icon class="stat-icon revenue-icon">attach_money</mat-icon>
                      <div class="stat-details">
                        <div class="stat-value">{{ getHistoryStats().totalRevenue | currency:'USD':'symbol':'1.0-0' }}</div>
                        <div class="stat-label">Total Revenue</div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- History Timeline -->
              <mat-card class="history-timeline-card">
                <mat-card-header>
                  <mat-card-title>Activity Timeline</mat-card-title>
                  <mat-card-subtitle>Recent vehicle activity and events</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="timeline-container">
                    <div class="timeline-item" *ngFor="let event of getVehicleHistory(); trackBy: trackHistoryEvent">
                      <div class="timeline-marker" [class]="'marker-' + event.type">
                        <mat-icon>{{ getHistoryEventIcon(event.type) }}</mat-icon>
                      </div>
                      <div class="timeline-content">
                        <div class="event-header">
                          <h4 class="event-title">{{ event.title }}</h4>
                          <span class="event-date">{{ event.date | date:'mediumDate' }}</span>
                        </div>
                        <p class="event-description">{{ event.description }}</p>
                        <div class="event-details" *ngIf="event.details">
                          <mat-chip-set>
                            <mat-chip *ngFor="let detail of event.details" 
                                      [color]="getEventDetailColor(event.type)">
                              {{ detail }}
                            </mat-chip>
                          </mat-chip-set>
                        </div>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Documents Tab -->
          <mat-tab label="Documents">
            <div class="tab-content">
              <!-- Upload Section -->
              <mat-card class="upload-card">
                <mat-card-header>
                  <mat-card-title>Upload New Document</mat-card-title>
                  <mat-card-subtitle>Add vehicle documents, certificates, and records</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="upload-section">
                    <div class="upload-area" 
                         [class.drag-over]="isDragOver"
                         (dragover)="onDragOver($event)"
                         (dragleave)="onDragLeave($event)"
                         (drop)="onFilesDrop($event)"
                         (click)="fileInput.click()">
                      <mat-icon class="upload-icon">cloud_upload</mat-icon>
                      <h3>Drop files here or click to browse</h3>
                      <p>Support for PDF, JPG, PNG files (max 10MB)</p>
                      <input #fileInput type="file" 
                             hidden 
                             multiple 
                             accept=".pdf,.jpg,.jpeg,.png"
                             (change)="onFilesSelected($event)">
                    </div>
                    
                    <div class="file-category-selection" *ngIf="selectedFiles.length > 0">
                      <h4>Categorize Documents:</h4>
                      <div class="category-chips">
                        <mat-chip-set>
                          <mat-chip *ngFor="let category of documentCategories" 
                                    [color]="selectedCategory === category.key ? 'primary' : ''"
                                    [class.selected-chip]="selectedCategory === category.key"
                                    (click)="selectedCategory = category.key">
                            <mat-icon matChipAvatar>{{ category.icon }}</mat-icon>
                            {{ category.label }}
                          </mat-chip>
                        </mat-chip-set>
                      </div>
                      
                      <div class="upload-actions">
                        <button mat-raised-button color="primary" 
                                [disabled]="!selectedCategory || isUploading"
                                (click)="uploadDocuments()">
                          <mat-icon>upload</mat-icon>
                          {{ isUploading ? 'Uploading...' : 'Upload Documents' }}
                        </button>
                        <button mat-button (click)="clearSelectedFiles()">Cancel</button>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <!-- Documents List -->
              <mat-card class="documents-card">
                <mat-card-header>
                  <mat-card-title>Vehicle Documents</mat-card-title>
                  <mat-card-subtitle>{{ getVehicleDocuments().length }} documents available</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="documents-filter">
                    <mat-form-field appearance="outline">
                      <mat-label>Filter by category</mat-label>
                      <mat-select [(value)]="documentFilter">
                        <mat-option value="">All Documents</mat-option>
                        <mat-option *ngFor="let category of documentCategories" [value]="category.key">
                          {{ category.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="documents-grid">
                    <div class="document-item" *ngFor="let document of getFilteredDocuments(); trackBy: trackDocument">
                      <div class="document-preview">
                        <mat-icon class="document-type-icon" [class]="'icon-' + document.type">{{ getDocumentIcon(document.type) }}</mat-icon>
                        <div class="document-overlay">
                          <button mat-icon-button (click)="previewDocument(document)">
                            <mat-icon>visibility</mat-icon>
                          </button>
                          <button mat-icon-button (click)="downloadDocument(document)">
                            <mat-icon>download</mat-icon>
                          </button>
                          <button mat-icon-button color="warn" (click)="deleteDocument(document)">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>
                      </div>
                      <div class="document-info">
                        <h4 class="document-name">{{ document.name }}</h4>
                        <div class="document-meta">
                          <mat-chip [color]="getCategoryColor(document.category)">{{ getCategoryLabel(document.category) }}</mat-chip>
                          <span class="document-date">{{ document.uploadDate | date:'shortDate' }}</span>
                        </div>
                        <p class="document-size">{{ formatFileSize(document.size) }}</p>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="getFilteredDocuments().length === 0" class="empty-documents">
                    <mat-icon>folder_open</mat-icon>
                    <h3>No documents found</h3>
                    <p>Upload your first document to get started.</p>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .vehicle-detail-container {
      padding: 24px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;

      .vehicle-title {
        h1 {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 400;
        }

        .subtitle {
          display: flex;
          align-items: center;
          gap: 16px;

          .license-plate {
            font-size: 1.2rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.6);
          }
        }
      }

      .actions {
        display: flex;
        gap: 12px;

        button mat-icon {
          margin-right: 8px;
        }
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .info-card {
      mat-list-item {
        mat-icon[matListItemIcon] {
          color: rgba(0, 0, 0, 0.54);
        }
      }
    }

    // History Tab Styles
    .history-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      
      .stat-card {
        .stat-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
        }
        
        .stat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          
          &.trips-icon { color: #2196f3; }
          &.distance-icon { color: #4caf50; }
          &.maintenance-icon { color: #ff9800; }
          &.revenue-icon { color: #9c27b0; }
        }
        
        .stat-value {
          font-size: 1.8rem;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }

    .history-timeline-card {
      .timeline-container {
        position: relative;
        padding: 20px 0;
        
        &::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          height: 100%;
          width: 2px;
          background: #e0e0e0;
        }
      }
      
      .timeline-item {
        display: flex;
        margin-bottom: 24px;
        position: relative;
        
        .timeline-marker {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          z-index: 1;
          
          &.marker-trip {
            background: #e3f2fd;
            color: #1976d2;
          }
          
          &.marker-maintenance {
            background: #fff3e0;
            color: #f57c00;
          }
          
          &.marker-status {
            background: #f3e5f5;
            color: #7b1fa2;
          }
          
          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
        
        .timeline-content {
          flex: 1;
          
          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          
          .event-title {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 500;
          }
          
          .event-date {
            color: rgba(0, 0, 0, 0.6);
            font-size: 0.875rem;
          }
          
          .event-description {
            margin: 0 0 12px 0;
            color: rgba(0, 0, 0, 0.7);
          }
          
          .event-details {
            mat-chip-set {
              mat-chip {
                font-size: 0.75rem;
                margin-right: 8px;
              }
            }
          }
        }
      }
    }

    // Documents Tab Styles
    .upload-card {
      margin-bottom: 24px;
      
      .upload-area {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover, &.drag-over {
          border-color: #2196f3;
          background-color: #f8f9fa;
        }
        
        .upload-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #666;
          margin-bottom: 16px;
        }
        
        h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        p {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
        }
      }
      
      .file-category-selection {
        margin-top: 24px;
        
        h4 {
          margin: 0 0 16px 0;
          font-size: 1rem;
        }
        
        .category-chips {
          margin-bottom: 24px;
          
          mat-chip-set {
            mat-chip {
              margin-right: 8px;
              margin-bottom: 8px;
              cursor: pointer;
              
              &:hover {
                background-color: rgba(0, 0, 0, 0.04);
              }
              
              &.selected-chip {
                background-color: #1976d2 !important;
                color: white !important;
                
                mat-icon {
                  color: white !important;
                }
              }
            }
          }
        }
        
        .upload-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
      }
    }

    .documents-card {
      .documents-filter {
        margin-bottom: 24px;
        
        mat-form-field {
          width: 200px;
        }
      }
      
      .documents-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
        
        .document-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
            
            .document-overlay {
              opacity: 1;
            }
          }
          
          .document-preview {
            position: relative;
            height: 120px;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .document-type-icon {
              font-size: 48px;
              width: 48px;
              height: 48px;
              color: #666;
              
              &.icon-pdf { color: #d32f2f; }
              &.icon-jpg, &.icon-jpeg, &.icon-png { color: #2196f3; }
            }
            
            .document-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              opacity: 0;
              transition: opacity 0.3s ease;
              
              button {
                background: rgba(255, 255, 255, 0.9);
              }
            }
          }
          
          .document-info {
            padding: 16px;
            
            .document-name {
              margin: 0 0 8px 0;
              font-size: 1rem;
              font-weight: 500;
              line-height: 1.3;
            }
            
            .document-meta {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 8px;
              
              mat-chip {
                font-size: 0.75rem;
              }
              
              .document-date {
                font-size: 0.875rem;
                color: rgba(0, 0, 0, 0.6);
              }
            }
            
            .document-size {
              margin: 0;
              font-size: 0.875rem;
              color: rgba(0, 0, 0, 0.6);
            }
          }
        }
      }
      
      .empty-documents {
        text-align: center;
        padding: 40px 20px;
        
        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #ccc;
          margin-bottom: 16px;
        }
        
        h3 {
          margin: 0 0 8px 0;
          color: #666;
        }
        
        p {
          margin: 0;
          color: #999;
        }
      }
    }

    @media (max-width: 768px) {
      .vehicle-detail-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;

        .actions {
          justify-content: stretch;

          button {
            flex: 1;
          }
        }
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }
      
      .history-stats-grid {
        grid-template-columns: 1fr;
      }
      
      .documents-grid {
        grid-template-columns: 1fr;
      }
      
      .timeline-container::before {
        left: 15px;
      }
      
      .timeline-item .timeline-marker {
        width: 30px;
        height: 30px;
        
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }
  `]
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private snackBar = inject(MatSnackBar);

  protected vehicle = this.vehicleService.selectedVehicle;
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  ngOnInit() {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    console.log('Vehicle Detail - Route ID:', vehicleId);
    
    if (vehicleId && vehicleId !== 'undefined') {
      this.loadVehicleDetails(vehicleId);
    } else {
      console.warn('Invalid or undefined vehicle ID, redirecting to vehicles list');
      this.router.navigate(['/vehicles']);
    }
  }

  protected async loadVehicleDetails(vehicleId?: string): Promise<void> {
    const id = vehicleId || this.route.snapshot.paramMap.get('id');
    if (!id || id === 'undefined') {
      console.warn('Cannot load vehicle with undefined ID');
      this.error.set('Invalid vehicle ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      console.log('Loading vehicle with ID:', id);
      await this.vehicleService.loadVehicle(id);
    } catch (error) {
      console.error('Error loading vehicle details:', error);
      this.error.set(error instanceof Error ? error.message : 'Failed to load vehicle details');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected getStatusColor(status: Status): string {
    switch (status) {
      case Status.ACTIVE:
        return 'primary';
      case Status.MAINTENANCE:
        return 'accent';
      case Status.INACTIVE:
        return 'warn';
      default:
        return '';
    }
  }

  protected getFuelTypeDisplay(fuelType: FuelType): string {
    switch (fuelType) {
      case FuelType.GASOLINE:
        return 'Gasoline';
      case FuelType.DIESEL:
        return 'Diesel';
      case FuelType.ELECTRIC:
        return 'Electric';
      case FuelType.HYBRID:
        return 'Hybrid';
      default:
        return fuelType;
    }
  }

  protected getMaintenanceStatus(): string {
    const vehicle = this.vehicle();
    if (!vehicle) return 'Unknown';

    const today = new Date();
    const nextMaintenance = new Date(vehicle.nextMaintenanceDate);
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilMaintenance < 0) {
      return 'Overdue';
    } else if (daysUntilMaintenance <= 7) {
      return 'Due Soon';
    } else {
      return 'Up to Date';
    }
  }

  protected getMaintenanceStatusColor(): string {
    const status = this.getMaintenanceStatus();
    switch (status) {
      case 'Overdue':
        return 'warn';
      case 'Due Soon':
        return 'accent';
      case 'Up to Date':
        return 'primary';
      default:
        return '';
    }
  }

  // History functionality
  protected getHistoryStats() {
    return {
      totalTrips: 47,
      totalDistance: 8543,
      maintenanceEvents: 8,
      totalRevenue: 15240
    };
  }

  protected getVehicleHistory() {
    return [
      {
        id: '1',
        type: 'trip',
        title: 'Trip Completed',
        description: 'Downtown to Airport - 23.5 miles',
        date: new Date('2024-03-10'),
        details: ['$45.50 earned', '1.2 hours']
      },
      {
        id: '2',
        type: 'maintenance',
        title: 'Oil Change',
        description: 'Scheduled maintenance completed at AutoCare Plus',
        date: new Date('2024-03-08'),
        details: ['$89.99', 'Next due: 3,000 mi']
      },
      {
        id: '3',
        type: 'trip',
        title: 'Long Distance Trip',
        description: 'City Center to State Park - 156.3 miles',
        date: new Date('2024-03-07'),
        details: ['$185.20 earned', '3.5 hours']
      },
      {
        id: '4',
        type: 'status',
        title: 'Status Changed to Active',
        description: 'Vehicle returned to active service after maintenance',
        date: new Date('2024-03-06'),
        details: ['Available for rental']
      },
      {
        id: '5',
        type: 'maintenance',
        title: 'Brake Inspection',
        description: 'Routine brake system inspection and adjustment',
        date: new Date('2024-03-05'),
        details: ['$125.00', 'All systems good']
      }
    ];
  }

  protected getHistoryEventIcon(type: string): string {
    switch (type) {
      case 'trip': return 'directions_car';
      case 'maintenance': return 'build';
      case 'status': return 'info';
      default: return 'event';
    }
  }

  protected getEventDetailColor(type: string): 'primary' | 'accent' | 'warn' | '' {
    switch (type) {
      case 'trip': return 'primary';
      case 'maintenance': return 'accent';
      case 'status': return '';
      default: return '';
    }
  }

  protected trackHistoryEvent(index: number, event: any) {
    return event.id;
  }

  // Documents functionality
  protected selectedFiles: File[] = [];
  protected selectedCategory: string = '';
  protected documentFilter: string = '';
  protected isDragOver: boolean = false;
  protected isUploading: boolean = false;

  protected documentCategories = [
    { key: 'registration', label: 'Registration', icon: 'assignment' },
    { key: 'insurance', label: 'Insurance', icon: 'security' },
    { key: 'maintenance', label: 'Maintenance Records', icon: 'build' },
    { key: 'inspection', label: 'Inspection Reports', icon: 'verified' },
    { key: 'other', label: 'Other Documents', icon: 'description' }
  ];

  protected getVehicleDocuments() {
    return [
      {
        id: '1',
        name: 'Vehicle Registration Certificate',
        category: 'registration',
        type: 'pdf',
        size: 1024576,
        uploadDate: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Insurance Policy',
        category: 'insurance',
        type: 'pdf',
        size: 2048576,
        uploadDate: new Date('2024-01-20')
      },
      {
        id: '3',
        name: 'Last Service Receipt',
        category: 'maintenance',
        type: 'jpg',
        size: 512000,
        uploadDate: new Date('2024-03-08')
      },
      {
        id: '4',
        name: 'Annual Inspection Report',
        category: 'inspection',
        type: 'pdf',
        size: 756000,
        uploadDate: new Date('2024-02-10')
      }
    ];
  }

  protected getFilteredDocuments() {
    const documents = this.getVehicleDocuments();
    if (!this.documentFilter) return documents;
    return documents.filter(doc => doc.category === this.documentFilter);
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  protected onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  protected onFilesDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  protected onFilesSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    this.addFiles(files);
  }

  private addFiles(files: File[]) {
    const validFiles = files.filter(file => {
      const isValidType = file.type.match(/^(application\/pdf|image\/(jpeg|jpg|png))$/);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });
    
    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    
    if (validFiles.length !== files.length) {
      this.snackBar.open('Some files were skipped. Only PDF, JPG, and PNG files under 10MB are allowed.', 'Close', {
        duration: 5000
      });
    }
  }

  protected clearSelectedFiles() {
    this.selectedFiles = [];
    this.selectedCategory = '';
  }

  protected async uploadDocuments() {
    if (!this.selectedCategory || this.selectedFiles.length === 0) return;
    
    this.isUploading = true;
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.snackBar.open(`Successfully uploaded ${this.selectedFiles.length} document(s)`, 'Close', {
        duration: 3000
      });
      
      this.clearSelectedFiles();
    } catch (error) {
      this.snackBar.open('Upload failed. Please try again.', 'Close', { duration: 5000 });
    } finally {
      this.isUploading = false;
    }
  }

  protected getDocumentIcon(type: string): string {
    switch (type) {
      case 'pdf': return 'picture_as_pdf';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'image';
      default: return 'description';
    }
  }

  protected getCategoryColor(category: string): 'primary' | 'accent' | 'warn' | '' {
    switch (category) {
      case 'registration': return 'primary';
      case 'insurance': return 'accent';
      case 'maintenance': return 'warn';
      default: return '';
    }
  }

  protected getCategoryLabel(category: string): string {
    const cat = this.documentCategories.find(c => c.key === category);
    return cat?.label || category;
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  protected previewDocument(document: any) {
    this.snackBar.open('Document preview functionality coming soon', 'Close', { duration: 3000 });
  }

  protected downloadDocument(document: any) {
    this.snackBar.open('Document download functionality coming soon', 'Close', { duration: 3000 });
  }

  protected deleteDocument(document: any) {
    if (confirm(`Are you sure you want to delete ${document.name}?`)) {
      this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
    }
  }

  protected trackDocument(index: number, document: any) {
    return document.id;
  }
}
