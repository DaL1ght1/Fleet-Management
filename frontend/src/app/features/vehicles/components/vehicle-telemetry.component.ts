import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import {
  RegisterTelemetryDeviceGQL,
  RevokeTelemetryDeviceGQL,
  VehicleDevicesGQL,
  VehicleTelemetryGQL,
} from '../../../core/graphql/generated';
import { AuthService } from '../../../core/auth/auth.service';
import { Roles } from '../../../core/auth/roles';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { TrackMapComponent } from '../../../shared/map/track-map.component';
import { DeviceKeyDialogComponent, DeviceKeyDialogData } from './device-key-dialog.component';

const TRACK_WINDOW_MS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-vehicle-telemetry',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatIconModule, TranslatePipe, HasRoleDirective, TrackMapComponent],
  templateUrl: './vehicle-telemetry.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleTelemetryComponent {
  readonly vehicleId = input.required<string>();
  readonly licensePlate = input('');

  protected readonly roles = Roles;

  private readonly telemetryGql = inject(VehicleTelemetryGQL);
  private readonly devicesGql = inject(VehicleDevicesGQL);
  private readonly registerGql = inject(RegisterTelemetryDeviceGQL);
  private readonly revokeGql = inject(RevokeTelemetryDeviceGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(AuthService);

  protected readonly telemetry = rxResource({
    params: () => ({
      id: this.vehicleId(),
      from: new Date(Date.now() - TRACK_WINDOW_MS).toISOString(),
      to: new Date().toISOString(),
    }),
    stream: ({ params }) => this.telemetryGql.fetch(params).pipe(map(result => result.data.vehicle)),
  });

  protected readonly devices = rxResource({
    params: () => (this.auth.hasAnyRole(Roles.MANAGEMENT) ? this.vehicleId() : null),
    stream: ({ params: id }) =>
      id ? this.devicesGql.fetch({ id }).pipe(map(result => result.data.vehicle?.telemetryDevices ?? [])) : of([]),
  });

  protected async registerDevice(): Promise<void> {
    const label = await this.confirm.prompt('telemetry.registerTitle', 'telemetry.deviceLabel', 'telemetry.register');
    if (!label) {
      return;
    }
    const result = await this.notifier.track(
      this.registerGql.mutate({ vehicleId: this.vehicleId(), label }),
      'telemetry.registered',
    );
    const apiKey = result?.data?.registerTelemetryDevice.apiKey;
    if (apiKey) {
      this.dialog.open<DeviceKeyDialogComponent, DeviceKeyDialogData>(DeviceKeyDialogComponent, {
        data: { apiKey },
        width: '520px',
        disableClose: true,
      });
      this.devices.reload();
    }
  }

  protected async revoke(id: string): Promise<void> {
    if (!(await this.confirm.confirm('telemetry.revokeTitle', 'telemetry.revokeMessage', 'telemetry.revoke', true))) {
      return;
    }
    if (await this.notifier.track(this.revokeGql.mutate({ id }), 'telemetry.revoked')) {
      this.devices.reload();
    }
  }
}
