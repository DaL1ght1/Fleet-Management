import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

import { TripService } from '../../../core/services/trip.service';
import { Trip, TripStatus, TripType } from '../../../core/models/trip.model';
import { TndCurrencyPipe } from '../../../shared/pipes/tnd-currency.pipe';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    TranslateModule,
    TndCurrencyPipe,
  ],
  template: `
    <div class="trip-detail-container">
      <div *ngIf="isLoading()" class="loading-content">
        <mat-spinner></mat-spinner>
        <p>{{ 'app.loading' | translate }}</p>
      </div>

      <div *ngIf="error()" class="error-content">
        <mat-icon>error</mat-icon>
        <h3>{{ 'trips.messages.loadError' | translate }}</h3>
        <p>{{ error() }}</p>
        <button mat-raised-button color="primary" (click)="loadTripDetails()">
          <mat-icon>refresh</mat-icon>
          {{ 'app.refresh' | translate }}
        </button>
      </div>

      <div *ngIf="trip() && !isLoading()" class="content">
        <!-- Header Section -->
        <div class="header-section">
          <div class="trip-title">
            <div class="back-nav">
              <button mat-stroked-button routerLink="/trips">
                <mat-icon>arrow_back</mat-icon>
                {{ 'app.back' | translate }}
              </button>
            </div>
            <h1>Trip #{{ trip()?.id?.substring(0, 8) }}</h1>
            <div class="trip-meta">
              <mat-chip-set>
                <mat-chip [color]="getStatusColor(trip()?.status!)" [class]="'status-chip-' + trip()?.status?.toLowerCase()">
                  <mat-icon matChipAvatar>{{ getStatusIcon(trip()?.status!) }}</mat-icon>
                  {{ 'trips.status.' + trip()?.status?.toLowerCase() | translate }}
                </mat-chip>
                <mat-chip [color]="getTypeColor(trip()?.type!)">
                  <mat-icon matChipAvatar>{{ getTypeIcon(trip()?.type!) }}</mat-icon>
                  {{ 'trips.type.' + trip()?.type?.toLowerCase() | translate }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>

          <div class="actions">
            <button mat-icon-button [matMenuTriggerFor]="actionMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <button mat-raised-button color="primary" [routerLink]="['/trips', trip()?.id, 'edit']">
              <mat-icon>edit</mat-icon>
              {{ 'app.edit' | translate }}
            </button>
          </div>
        </div>

        <mat-tab-group>
          <!-- Overview Tab -->
          <mat-tab [label]="'dashboard.subtitle' | translate">
            <div class="tab-content">
              <div class="overview-grid">
                <!-- Route Information Card -->
                <mat-card class="info-card route-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'trips.fields.route' | translate }}</mat-card-title>
                    <mat-card-subtitle>Trip route and locations</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="route-display">
                      <div class="route-point start-point">
                        <mat-icon class="location-icon start-icon">location_on</mat-icon>
                        <div class="location-details">
                          <div class="location-label">{{ 'trips.fields.pickupLocation' | translate }}</div>
                          <div class="location-address">{{ trip()?.startLocation?.address }}</div>
                          <div class="location-coords" *ngIf="trip()?.startLocation?.city">
                            {{ trip()?.startLocation?.city }}, {{ trip()?.startLocation?.state }}
                          </div>
                        </div>
                      </div>
                      
                      <div class="route-line">
                        <mat-icon>arrow_downward</mat-icon>
                        <div class="distance-info" *ngIf="trip()?.distance">
                          {{ trip()?.distance | number:'1.1-1' }} miles
                        </div>
                      </div>
                      
                      <div class="route-point end-point">
                        <mat-icon class="location-icon end-icon">flag</mat-icon>
                        <div class="location-details">
                          <div class="location-label">{{ 'trips.fields.dropoffLocation' | translate }}</div>
                          <div class="location-address">{{ trip()?.endLocation?.address }}</div>
                          <div class="location-coords" *ngIf="trip()?.endLocation?.city">
                            {{ trip()?.endLocation?.city }}, {{ trip()?.endLocation?.state }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Vehicle Information Card -->
                <mat-card class="info-card" *ngIf="trip()?.vehicleId">
                  <mat-card-header>
                    <mat-card-title>{{ 'navigation.vehicles' | translate }}</mat-card-title>
                    <mat-card-subtitle>Assigned vehicle details</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item *ngIf="trip()?.vehicle">
                        <mat-icon matListItemIcon>directions_car</mat-icon>
                        <div matListItemTitle>{{ trip()?.vehicle?.year }} {{ trip()?.vehicle?.make }} {{ trip()?.vehicle?.model }}</div>
                        <div matListItemLine>{{ trip()?.vehicle?.licensePlate }} • {{ trip()?.vehicle?.color }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="!trip()?.vehicle">
                        <mat-icon matListItemIcon>directions_car</mat-icon>
                        <div matListItemTitle>Vehicle ID</div>
                        <div matListItemLine>{{ trip()?.vehicleId }}</div>
                      </mat-list-item>
                    </mat-list>
                    <div class="card-actions">
                      <button mat-stroked-button [routerLink]="['/vehicles', trip()?.vehicleId]">
                        <mat-icon>visibility</mat-icon>
                        {{ 'trips.actions.viewDetails' | translate }}
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Driver Information Card -->
                <mat-card class="info-card" *ngIf="trip()?.driverId">
                  <mat-card-header>
                    <mat-card-title>{{ 'trips.fields.driver' | translate }}</mat-card-title>
                    <mat-card-subtitle>Assigned driver details</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item *ngIf="trip()?.driver">
                        <mat-icon matListItemIcon>person</mat-icon>
                        <div matListItemTitle>{{ trip()?.driver?.firstName }} {{ trip()?.driver?.lastName }}</div>
                        <div matListItemLine>{{ trip()?.driver?.email }} • {{ trip()?.driver?.phone }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="!trip()?.driver">
                        <mat-icon matListItemIcon>person</mat-icon>
                        <div matListItemTitle>Driver ID</div>
                        <div matListItemLine>{{ trip()?.driverId }}</div>
                      </mat-list-item>
                    </mat-list>
                    <div class="card-actions">
                      <button mat-stroked-button [routerLink]="['/drivers', trip()?.driverId]">
                        <mat-icon>visibility</mat-icon>
                        {{ 'trips.actions.viewDetails' | translate }}
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>

                <!-- Trip Timing Card -->
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>{{ 'trips.fields.timing' | translate }}</mat-card-title>
                    <mat-card-subtitle>Scheduled and actual times</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item>
                        <mat-icon matListItemIcon>schedule</mat-icon>
                        <div matListItemTitle>Scheduled Start</div>
                        <div matListItemLine>{{ trip()?.scheduledStartTime | date:'medium' }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="trip()?.scheduledEndTime">
                        <mat-icon matListItemIcon>schedule</mat-icon>
                        <div matListItemTitle>Scheduled End</div>
                        <div matListItemLine>{{ trip()?.scheduledEndTime | date:'medium' }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="trip()?.startTime">
                        <mat-icon matListItemIcon>play_arrow</mat-icon>
                        <div matListItemTitle>Actual Start</div>
                        <div matListItemLine>{{ trip()?.startTime | date:'medium' }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="trip()?.endTime">
                        <mat-icon matListItemIcon>stop</mat-icon>
                        <div matListItemTitle>Actual End</div>
                        <div matListItemLine>{{ trip()?.endTime | date:'medium' }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="trip()?.duration">
                        <mat-icon matListItemIcon>timer</mat-icon>
                        <div matListItemTitle>Duration</div>
                        <div matListItemLine>{{ formatDuration(trip()?.duration!) }}</div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>

                <!-- Financial Information Card -->
                <mat-card class="info-card" *ngIf="hasCostInfo()">
                  <mat-card-header>
                    <mat-card-title>{{ 'billing.invoice' | translate }}</mat-card-title>
                    <mat-card-subtitle>Trip costs and fees</mat-card-subtitle>
                  </mat-card-header>
                  <mat-card-content>
                    <mat-list>
                      <mat-list-item *ngIf="trip()?.baseRate">
                        <mat-icon matListItemIcon>attach_money</mat-icon>
                        <div matListItemTitle>Base Rate</div>
                        <div matListItemLine>{{ trip()?.baseRate | tndCurrency }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="trip()?.fuelCost">
                        <mat-icon matListItemIcon>local_gas_station</mat-icon>
                        <div matListItemTitle>Fuel Cost</div>
                        <div matListItemLine>{{ trip()?.fuelCost | tndCurrency }}</div>
                      </mat-list-item>
                      <mat-list-item *ngIf="trip()?.additionalFees">
                        <mat-icon matListItemIcon>receipt</mat-icon>
                        <div matListItemTitle>Additional Fees</div>
                        <div matListItemLine>{{ trip()?.additionalFees | tndCurrency }}</div>
                      </mat-list-item>
                      <mat-divider *ngIf="trip()?.totalCost"></mat-divider>
                      <mat-list-item *ngIf="trip()?.totalCost" class="total-cost">
                        <mat-icon matListItemIcon>calculate</mat-icon>
                        <div matListItemTitle><strong>Total Cost</strong></div>
                        <div matListItemLine><strong>{{ trip()?.totalCost | tndCurrency }}</strong></div>
                      </mat-list-item>
                    </mat-list>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- Notes Tab -->
          <mat-tab label="Notes" *ngIf="hasNotes()">
            <div class="tab-content">
              <mat-card class="notes-card" *ngIf="trip()?.notes">
                <mat-card-header>
                  <mat-card-title>Trip Notes</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ trip()?.notes }}</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="notes-card" *ngIf="trip()?.customerNotes">
                <mat-card-header>
                  <mat-card-title>Customer Notes</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ trip()?.customerNotes }}</p>
                </mat-card-content>
              </mat-card>

              <mat-card class="notes-card" *ngIf="trip()?.internalNotes">
                <mat-card-header>
                  <mat-card-title>Internal Notes</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <p>{{ trip()?.internalNotes }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Timeline Tab -->
          <mat-tab label="Timeline">
            <div class="tab-content">
              <mat-card class="timeline-card">
                <mat-card-header>
                  <mat-card-title>Trip Timeline</mat-card-title>
                  <mat-card-subtitle>Key events and status changes</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="timeline-container">
                    <div class="timeline-item" *ngFor="let event of getTripTimeline(); trackBy: trackTimelineEvent">
                      <div class="timeline-marker" [class]="'marker-' + event.type">
                        <mat-icon>{{ event.icon }}</mat-icon>
                      </div>
                      <div class="timeline-content">
                        <div class="event-header">
                          <h4 class="event-title">{{ event.title }}</h4>
                          <span class="event-date">{{ event.timestamp | date:'medium' }}</span>
                        </div>
                        <p class="event-description">{{ event.description }}</p>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>

    <!-- Action Menu -->
    <mat-menu #actionMenu="matMenu">
      <button mat-menu-item (click)="startTrip()" 
              [disabled]="trip()?.status !== TripStatus.SCHEDULED" 
              *ngIf="trip()?.status === TripStatus.SCHEDULED">
        <mat-icon>play_arrow</mat-icon>
        <span>{{ 'trips.actions.start' | translate }}</span>
      </button>
      <button mat-menu-item (click)="completeTrip()" 
              [disabled]="trip()?.status !== TripStatus.IN_PROGRESS" 
              *ngIf="trip()?.status === TripStatus.IN_PROGRESS">
        <mat-icon>check_circle</mat-icon>
        <span>{{ 'trips.actions.complete' | translate }}</span>
      </button>
      <button mat-menu-item (click)="cancelTrip()" 
              [disabled]="trip()?.status === TripStatus.COMPLETED || trip()?.status === TripStatus.CANCELLED">
        <mat-icon>cancel</mat-icon>
        <span>{{ 'trips.actions.cancel' | translate }}</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="confirmDelete()" class="delete-action">
        <mat-icon>delete</mat-icon>
        <span>{{ 'app.delete' | translate }}</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .trip-detail-container {
      padding: 24px;
    }

    .loading-content, .error-content {
      text-align: center;
      padding: 80px 20px;
      
      mat-spinner {
        margin: 0 auto 16px;
      }
      
      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ff6b6b;
        margin-bottom: 16px;
      }
      
      h3 {
        margin: 0 0 8px 0;
        color: #666;
      }
      
      p {
        margin: 0 0 24px 0;
        color: #999;
      }
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e0e0e0;
      
      .trip-title {
        .back-nav {
          margin-bottom: 16px;
        }
        
        h1 {
          margin: 0 0 16px 0;
          font-size: 2.5rem;
          font-weight: 400;
          color: #333;
        }
        
        .trip-meta {
          mat-chip-set {
            mat-chip {
              margin-right: 12px;
              font-weight: 500;
            }
          }
        }
      }
      
      .actions {
        display: flex;
        gap: 12px;
        align-items: center;
        
        button {
          mat-icon {
            margin-right: 8px;
          }
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
      .card-actions {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
      }
      
      mat-list-item {
        mat-icon[matListItemIcon] {
          color: rgba(0, 0, 0, 0.54);
        }
        
        &.total-cost {
          background-color: #f8f9fa;
          border-radius: 8px;
          margin: 8px 0;
          
          mat-icon[matListItemIcon] {
            color: #4caf50;
          }
        }
      }
    }

    .route-card {
      grid-column: span 2;
      
      @media (max-width: 768px) {
        grid-column: span 1;
      }
      
      .route-display {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 16px;
        
        .route-point {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          
          .location-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            margin-top: 4px;
            
            &.start-icon {
              color: #4caf50;
            }
            
            &.end-icon {
              color: #f44336;
            }
          }
          
          .location-details {
            flex: 1;
            
            .location-label {
              font-size: 0.875rem;
              font-weight: 500;
              color: rgba(0, 0, 0, 0.6);
              margin-bottom: 4px;
            }
            
            .location-address {
              font-size: 1.1rem;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .location-coords {
              font-size: 0.875rem;
              color: rgba(0, 0, 0, 0.6);
            }
          }
        }
        
        .route-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin: 0 32px;
          
          mat-icon {
            color: #2196f3;
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
          
          .distance-info {
            background: #e3f2fd;
            color: #1565c0;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 0.875rem;
            font-weight: 500;
          }
        }
      }
    }

    .notes-card {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      p {
        line-height: 1.6;
        margin: 0;
      }
    }

    .timeline-card {
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
          
          &.marker-created {
            background: #e3f2fd;
            color: #1976d2;
          }
          
          &.marker-started {
            background: #e8f5e8;
            color: #2e7d32;
          }
          
          &.marker-completed {
            background: #e3f2fd;
            color: #1565c0;
          }
          
          &.marker-cancelled {
            background: #ffebee;
            color: #c62828;
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
            margin: 0;
            color: rgba(0, 0, 0, 0.7);
          }
        }
      }
    }

    .delete-action {
      color: #f44336;
    }
    
    // Custom chip styling
    mat-chip-set {
      mat-chip {
        font-weight: 500;
        
        &[color="primary"], &.status-chip-scheduled {
          background-color: #fff3e0 !important;
          color: #e65100 !important;
          border: 1px solid #ff9800 !important;
        }
        
        &[color="accent"], &.status-chip-in_progress {
          background-color: #e8f5e8 !important;
          color: #2e7d32 !important;
          border: 1px solid #4caf50 !important;
        }
        
        &[color="warn"], &.status-chip-cancelled {
          background-color: #ffebee !important;
          color: #c62828 !important;
          border: 1px solid #f44336 !important;
        }
        
        &.status-chip-completed {
          background-color: #e3f2fd !important;
          color: #1565c0 !important;
          border: 1px solid #2196f3 !important;
        }
      }
    }

    @media (max-width: 768px) {
      .trip-detail-container {
        padding: 16px;
      }
      
      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
        
        .trip-title h1 {
          font-size: 2rem;
        }
        
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
    }
  `]
})
export class TripDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tripService = inject(TripService);
  private snackBar = inject(MatSnackBar);

  // Make enums available to template
  protected readonly TripStatus = TripStatus;
  protected readonly TripType = TripType;

  protected trip = signal<Trip | null>(null);
  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  ngOnInit() {
    const tripId = this.route.snapshot.paramMap.get('id');
    console.log('Trip Detail - Route ID:', tripId);
    
    if (tripId && tripId !== 'undefined') {
      this.loadTripDetails(tripId);
    } else {
      console.warn('Invalid or undefined trip ID, redirecting to trips list');
      this.router.navigate(['/trips']);
    }
  }

  protected async loadTripDetails(tripId?: string): Promise<void> {
    const id = tripId || this.route.snapshot.paramMap.get('id');
    if (!id || id === 'undefined') {
      console.warn('Cannot load trip with undefined ID');
      this.error.set('Invalid trip ID');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      console.log('Loading trip with ID:', id);
      const tripData = await this.tripService.loadTrip(id);
      if (tripData) {
        this.trip.set(tripData);
      } else {
        this.error.set('Trip not found');
      }
    } catch (error) {
      console.error('Error loading trip details:', error);
      this.error.set(error instanceof Error ? error.message : 'Failed to load trip details');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected getStatusColor(status: TripStatus): 'primary' | 'accent' | 'warn' | '' {
    switch (status) {
      case TripStatus.SCHEDULED:
        return 'primary';
      case TripStatus.IN_PROGRESS:
        return 'accent';
      case TripStatus.COMPLETED:
        return '';
      case TripStatus.CANCELLED:
        return 'warn';
      default:
        return '';
    }
  }

  protected getTypeColor(type: TripType): 'primary' | 'accent' | 'warn' | '' {
    switch (type) {
      case TripType.RENTAL:
        return 'primary';
      case TripType.MAINTENANCE:
        return 'warn';
      case TripType.RELOCATION:
        return 'accent';
      case TripType.EMERGENCY:
        return 'warn';
      default:
        return '';
    }
  }

  protected getStatusIcon(status: TripStatus): string {
    switch (status) {
      case TripStatus.SCHEDULED: return 'schedule';
      case TripStatus.IN_PROGRESS: return 'play_arrow';
      case TripStatus.COMPLETED: return 'check_circle';
      case TripStatus.CANCELLED: return 'cancel';
      default: return 'info';
    }
  }

  protected getTypeIcon(type: TripType): string {
    switch (type) {
      case TripType.RENTAL: return 'car_rental';
      case TripType.MAINTENANCE: return 'build';
      case TripType.RELOCATION: return 'location_on';
      case TripType.EMERGENCY: return 'emergency';
      default: return 'map';
    }
  }

  protected hasCostInfo(): boolean {
    const t = this.trip();
    return !!(t?.baseRate || t?.fuelCost || t?.additionalFees || t?.totalCost);
  }

  protected hasNotes(): boolean {
    const t = this.trip();
    return !!(t?.notes || t?.customerNotes || t?.internalNotes);
  }

  protected formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    } else if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  protected getTripTimeline() {
    const trip = this.trip();
    if (!trip) return [];

    const timeline = [
      {
        id: 'created',
        type: 'created',
        icon: 'add',
        title: 'Trip Created',
        description: `Trip scheduled for ${trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleDateString() : 'unknown date'}`,
        timestamp: trip.createdAt || trip.scheduledStartTime || new Date().toISOString()
      }
    ];

    if (trip.startTime) {
      timeline.push({
        id: 'started',
        type: 'started',
        icon: 'play_arrow',
        title: 'Trip Started',
        description: 'Trip began successfully',
        timestamp: trip.startTime
      });
    }

    if (trip.endTime) {
      timeline.push({
        id: 'completed',
        type: 'completed',
        icon: 'check_circle',
        title: 'Trip Completed',
        description: `Trip completed after ${trip.duration ? this.formatDuration(trip.duration) : 'unknown duration'}`,
        timestamp: trip.endTime
      });
    }

    if (trip.status === TripStatus.CANCELLED) {
      timeline.push({
        id: 'cancelled',
        type: 'cancelled',
        icon: 'cancel',
        title: 'Trip Cancelled',
        description: 'Trip was cancelled',
        timestamp: trip.updatedAt || new Date().toISOString()
      });
    }

    return timeline.sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });
  }

  protected trackTimelineEvent(index: number, event: any) {
    return event.id;
  }

  protected async startTrip(): Promise<void> {
    const trip = this.trip();
    if (!trip?.id) return;
    
    try {
      await this.tripService.startTrip(trip.id);
      this.snackBar.open('Trip started successfully', 'Close', { duration: 3000 });
      await this.loadTripDetails(); // Reload to get updated data
    } catch (error) {
      console.error('Error starting trip:', error);
      this.snackBar.open('Failed to start trip', 'Close', { duration: 5000 });
    }
  }

  protected async completeTrip(): Promise<void> {
    const trip = this.trip();
    if (!trip?.id) return;
    
    try {
      await this.tripService.completeTrip(trip.id);
      this.snackBar.open('Trip completed successfully', 'Close', { duration: 3000 });
      await this.loadTripDetails(); // Reload to get updated data
    } catch (error) {
      console.error('Error completing trip:', error);
      this.snackBar.open('Failed to complete trip', 'Close', { duration: 5000 });
    }
  }

  protected async cancelTrip(): Promise<void> {
    const trip = this.trip();
    if (!trip?.id) return;
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    if (reason !== null) { // User didn't cancel the prompt
      try {
        await this.tripService.cancelTrip(trip.id, reason || undefined);
        this.snackBar.open('Trip cancelled successfully', 'Close', { duration: 3000 });
        await this.loadTripDetails(); // Reload to get updated data
      } catch (error) {
        console.error('Error cancelling trip:', error);
        this.snackBar.open('Failed to cancel trip', 'Close', { duration: 5000 });
      }
    }
  }

  protected confirmDelete(): void {
    const trip = this.trip();
    if (!trip || !trip.id) return;
    
    const confirmed = confirm(`Are you sure you want to delete trip #${trip.id.substring(0, 8)}?`);
    
    if (confirmed) {
      this.deleteTrip();
    }
  }

  private async deleteTrip(): Promise<void> {
    const trip = this.trip();
    if (!trip?.id) return;
    
    try {
      await this.tripService.deleteTrip(trip.id);
      this.snackBar.open('Trip deleted successfully', 'Close', { duration: 3000 });
      this.router.navigate(['/trips']);
    } catch (error) {
      console.error('Error deleting trip:', error);
      this.snackBar.open('Failed to delete trip', 'Close', { duration: 5000 });
    }
  }
}
