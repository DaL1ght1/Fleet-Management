import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { DeleteGeofenceGQL, GeofencesGQL, SetGeofenceActiveGQL } from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { ZoneMapComponent } from '../../../shared/map/zone-map.component';

@Component({
  selector: 'app-geofence-list-page',
  imports: [
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    LoadStateComponent,
    ZoneMapComponent,
  ],
  templateUrl: './geofence-list.page.html',
  styleUrl: './geofence-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeofenceListPage {
  protected readonly roles = Roles;

  private readonly geofencesGql = inject(GeofencesGQL);
  private readonly setActiveGql = inject(SetGeofenceActiveGQL);
  private readonly deleteGql = inject(DeleteGeofenceGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);

  protected readonly geofences = rxResource({
    stream: () => this.geofencesGql.fetch().pipe(map(result => result.data.geofences)),
  });

  protected readonly zones = computed(() => this.geofences.value() ?? []);

  protected async toggle(id: string, active: boolean): Promise<void> {
    if (await this.notifier.track(this.setActiveGql.mutate({ id, active }), 'geofences.updated')) {
      this.geofences.reload();
    }
  }

  protected async remove(id: string): Promise<void> {
    if (!(await this.confirm.confirm('geofences.deleteTitle', 'geofences.deleteMessage', 'common.delete', true))) {
      return;
    }
    if (await this.notifier.track(this.deleteGql.mutate({ id }), 'geofences.deleted')) {
      this.geofences.reload();
    }
  }
}
