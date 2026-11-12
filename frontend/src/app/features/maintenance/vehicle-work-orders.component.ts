import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { VehicleWorkOrdersGQL } from '../../core/graphql/generated';
import { AuthService } from '../../core/auth/auth.service';
import { Roles } from '../../core/auth/roles';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { KIND_ICONS } from './maintenance-options';

const VISIBLE_ORDERS = 5;

@Component({
  selector: 'app-vehicle-work-orders',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, TranslatePipe, StatusChipComponent],
  template: `
    @if (allowed()) {
      <section class="card">
        <div class="section-heading">
          <h2>{{ 'maintenance.workOrders' | translate }}</h2>
          <a mat-stroked-button routerLink="/maintenance/new" [queryParams]="{ vehicleId: vehicleId() }">
            <mat-icon>add</mat-icon>
            {{ 'maintenance.schedule' | translate }}
          </a>
        </div>
        @if (orders().length) {
          <ul>
            @for (order of orders(); track order.id) {
              <li>
                <a [routerLink]="['/maintenance', order.id]">
                  <mat-icon>{{ kindIcons[order.kind] }}</mat-icon>
                  <span class="text">
                    <span class="strong">{{ order.title }}</span>
                    <span class="muted">{{ order.scheduledFor | date: 'mediumDate' }}</span>
                  </span>
                  <app-status-chip [status]="order.overdue ? 'OVERDUE' : order.status" />
                </a>
              </li>
            }
          </ul>
        } @else {
          <p class="muted">{{ 'maintenance.noneForVehicle' | translate }}</p>
        }
      </section>
    }
  `,
  styles: `
    ul {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2);
      border-radius: var(--radius-control);
      color: inherit;
      text-decoration: none;

      &:hover {
        background: var(--surface-hover);
      }

      mat-icon {
        color: var(--ink-muted);
      }
    }

    .text {
      display: grid;
      min-inline-size: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleWorkOrdersComponent {
  readonly vehicleId = input.required<string>();

  protected readonly kindIcons = KIND_ICONS;
  private readonly auth = inject(AuthService);
  protected readonly allowed = computed(() => this.auth.hasAnyRole(Roles.MANAGEMENT));
  private readonly workOrdersGql = inject(VehicleWorkOrdersGQL);

  private readonly workOrders = rxResource({
    params: () => (this.allowed() ? this.vehicleId() : null),
    stream: ({ params: id }) =>
      id
        ? this.workOrdersGql.fetch({ id }).pipe(
            map(result => result.data.vehicle?.workOrders ?? []),
            catchError(() => of([])),
          )
        : of([]),
  });

  protected readonly orders = computed(() => (this.workOrders.value() ?? []).slice(0, VISIBLE_ORDERS));
}
