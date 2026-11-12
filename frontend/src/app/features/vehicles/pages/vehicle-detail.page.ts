import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  ChangeVehicleStatusGQL,
  DeleteVehicleGQL,
  RecordOdometerReadingGQL,
  VehicleGQL,
  VehicleStatus,
} from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { VEHICLE_STATUSES } from '../vehicle-options';
import { VehicleTelemetryComponent } from '../components/vehicle-telemetry.component';
import { VehicleWorkOrdersComponent } from '../../maintenance/vehicle-work-orders.component';

@Component({
  selector: 'app-vehicle-detail-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    StatusChipComponent,
    LoadStateComponent,
    MoneyPipe,
    VehicleTelemetryComponent,
    VehicleWorkOrdersComponent,
  ],
  templateUrl: './vehicle-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDetailPage {
  readonly id = input.required<string>();

  protected readonly roles = Roles;
  protected readonly statuses = VEHICLE_STATUSES;
  protected readonly odometer = signal<number | null>(null);

  private readonly vehicleGql = inject(VehicleGQL);
  private readonly changeStatusGql = inject(ChangeVehicleStatusGQL);
  private readonly recordOdometerGql = inject(RecordOdometerReadingGQL);
  private readonly deleteGql = inject(DeleteVehicleGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  protected readonly vehicle = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.vehicleGql.fetch(params).pipe(map(result => result.data.vehicle)),
  });

  protected async changeStatus(status: VehicleStatus): Promise<void> {
    if (await this.notifier.track(this.changeStatusGql.mutate({ id: this.id(), status }), 'vehicles.statusChanged')) {
      this.vehicle.reload();
    }
  }

  protected async recordOdometer(): Promise<void> {
    const mileage = this.odometer();
    if (mileage === null) {
      return;
    }
    if (
      await this.notifier.track(this.recordOdometerGql.mutate({ id: this.id(), mileage }), 'vehicles.odometerRecorded')
    ) {
      this.odometer.set(null);
      this.vehicle.reload();
    }
  }

  protected async remove(): Promise<void> {
    if (!(await this.confirm.confirm('vehicles.deleteTitle', 'vehicles.deleteMessage', 'common.delete', true))) {
      return;
    }
    if (await this.notifier.track(this.deleteGql.mutate({ id: this.id() }), 'vehicles.deleted')) {
      void this.router.navigate(['/vehicles']);
    }
  }
}
