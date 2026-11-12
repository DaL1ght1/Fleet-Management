import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, of } from 'rxjs';
import { FleetPositionsGQL, FleetPositionsQuery, GeofencesGQL } from '../../core/graphql/generated';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { FleetMapComponent, FleetMarker } from '../../shared/map/fleet-map.component';

const REFRESH_INTERVAL_MS = 10_000;

type FleetPosition = FleetPositionsQuery['vehiclePositions'][number];

const stateOf = (position: FleetPosition): FleetMarker['state'] =>
  position.stale ? 'stale' : position.moving ? 'moving' : 'idle';

@Component({
  selector: 'app-fleet-map-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    PageHeaderComponent,
    StatusChipComponent,
    FleetMapComponent,
  ],
  templateUrl: './fleet-map.page.html',
  styleUrl: './fleet-map.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetMapPage {
  private readonly positionsQuery = inject(FleetPositionsGQL).watch(
    {},
    { pollInterval: REFRESH_INTERVAL_MS, fetchPolicy: 'network-only' },
  );

  protected readonly positions = toSignal(
    this.positionsQuery.valueChanges.pipe(
      map(result => result.data?.vehiclePositions ?? []),
      catchError(() => of<FleetPosition[]>([])),
    ),
    { initialValue: [] as FleetPosition[] },
  );

  protected readonly zones = toSignal(
    inject(GeofencesGQL)
      .fetch()
      .pipe(
        map(result => result.data.geofences),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );

  protected readonly selectedId = signal<string | null>(null);

  protected readonly markers = computed<FleetMarker[]>(() =>
    this.positions().map(position => ({
      id: position.vehicle.id,
      label: position.vehicle.licensePlate,
      latitude: position.latitude,
      longitude: position.longitude,
      state: stateOf(position),
    })),
  );

  protected readonly selected = computed(
    () => this.positions().find(position => position.vehicle.id === this.selectedId()) ?? null,
  );

  protected readonly summary = computed(() => {
    const positions = this.positions();
    return {
      moving: positions.filter(position => stateOf(position) === 'moving').length,
      idle: positions.filter(position => stateOf(position) === 'idle').length,
      stale: positions.filter(position => stateOf(position) === 'stale').length,
    };
  });

  protected select(id: string): void {
    this.selectedId.set(id);
  }

  protected refresh(): void {
    void this.positionsQuery.refetch();
  }
}
