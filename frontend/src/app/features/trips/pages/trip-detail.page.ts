import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { CancelTripGQL, CompleteTripGQL, DeleteTripGQL, StartTripGQL, TripGQL } from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { RouteMapComponent } from '../../../shared/map/route-map.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'app-trip-detail-page',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    StatusChipComponent,
    LoadStateComponent,
    RouteMapComponent,
    MoneyPipe,
  ],
  templateUrl: './trip-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripDetailPage {
  readonly id = input.required<string>();

  protected readonly roles = Roles;

  private readonly tripGql = inject(TripGQL);
  private readonly startGql = inject(StartTripGQL);
  private readonly completeGql = inject(CompleteTripGQL);
  private readonly cancelGql = inject(CancelTripGQL);
  private readonly deleteGql = inject(DeleteTripGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  protected readonly completion = inject(NonNullableFormBuilder).group({
    distanceKm: [0, [Validators.required, Validators.min(0)]],
    fuelCost: [null as number | null, Validators.min(0)],
    additionalFees: [null as number | null, Validators.min(0)],
  });

  protected readonly trip = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.tripGql.fetch(params).pipe(map(result => result.data.trip)),
  });

  protected async start(): Promise<void> {
    if (await this.notifier.track(this.startGql.mutate({ id: this.id() }), 'trips.started')) {
      this.trip.reload();
    }
  }

  protected async complete(): Promise<void> {
    if (this.completion.invalid) {
      this.completion.markAllAsTouched();
      return;
    }
    const input = this.completion.getRawValue();
    if (await this.notifier.track(this.completeGql.mutate({ id: this.id(), input }), 'trips.completed')) {
      this.trip.reload();
    }
  }

  protected async cancel(): Promise<void> {
    const reason = await this.confirm.prompt('trips.cancelTitle', 'trips.cancellationReason', 'trips.cancelTrip');
    if (reason && (await this.notifier.track(this.cancelGql.mutate({ id: this.id(), reason }), 'trips.cancelled'))) {
      this.trip.reload();
    }
  }

  protected async remove(): Promise<void> {
    if (!(await this.confirm.confirm('trips.deleteTitle', 'trips.deleteMessage', 'common.delete', true))) {
      return;
    }
    if (await this.notifier.track(this.deleteGql.mutate({ id: this.id() }), 'trips.deleted')) {
      void this.router.navigate(['/trips']);
    }
  }
}
