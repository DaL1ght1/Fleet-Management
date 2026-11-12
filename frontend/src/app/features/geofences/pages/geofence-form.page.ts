import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import {
  CreateGeofenceGQL,
  GeofenceGQL,
  GeofenceInput,
  GeofenceKind,
  GeofencesGQL,
  UpdateGeofenceGQL,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ZoneMapComponent } from '../../../shared/map/zone-map.component';
import { ZonePoint } from '../../../shared/map/zone';

type Shape = 'polygon' | 'circle';

const KINDS: readonly GeofenceKind[] = ['DEPOT', 'SERVICE_AREA', 'RESTRICTED'];
const MIN_POLYGON_POINTS = 3;
const DEFAULT_RADIUS_METERS = 500;

@Component({
  selector: 'app-geofence-form-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    TranslatePipe,
    PageHeaderComponent,
    ZoneMapComponent,
  ],
  templateUrl: './geofence-form.page.html',
  styleUrl: './geofence-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeofenceFormPage {
  readonly id = input<string>();

  protected readonly kinds = KINDS;
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly shape = signal<Shape>('polygon');
  protected readonly polygon = signal<readonly ZonePoint[]>([]);
  protected readonly center = signal<ZonePoint | null>(null);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly geofenceGql = inject(GeofenceGQL);
  private readonly geofencesGql = inject(GeofencesGQL);
  private readonly createGql = inject(CreateGeofenceGQL);
  private readonly updateGql = inject(UpdateGeofenceGQL);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    kind: ['SERVICE_AREA' as GeofenceKind, Validators.required],
    speedLimitKph: [null as number | null, [Validators.min(1), Validators.max(200)]],
    radiusMeters: [DEFAULT_RADIUS_METERS, [Validators.min(10), Validators.max(200000)]],
  });

  protected readonly kind = toSignal(this.form.controls.kind.valueChanges, {
    initialValue: this.form.controls.kind.value,
  });
  protected readonly radius = toSignal(this.form.controls.radiusMeters.valueChanges, {
    initialValue: DEFAULT_RADIUS_METERS,
  });

  protected readonly otherZones = rxResource({
    stream: () =>
      this.geofencesGql
        .fetch()
        .pipe(map(result => result.data.geofences.filter(geofence => geofence.id !== this.id()))),
  });

  private readonly existing = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) =>
      id ? this.geofenceGql.fetch({ id }).pipe(map(result => result.data.geofence)) : of(null),
  });

  protected readonly shapeMissing = computed(
    () =>
      this.submitted() &&
      (this.shape() === 'polygon' ? this.polygon().length < MIN_POLYGON_POINTS : this.center() === null),
  );

  constructor() {
    effect(() => {
      const geofence = this.existing.value();
      if (!geofence) {
        return;
      }
      this.form.patchValue({
        name: geofence.name,
        kind: geofence.kind,
        speedLimitKph: geofence.speedLimitKph,
        radiusMeters: geofence.radiusMeters ?? DEFAULT_RADIUS_METERS,
      });
      if (geofence.polygon?.length) {
        this.shape.set('polygon');
        this.polygon.set(geofence.polygon);
      } else {
        this.shape.set('circle');
        this.center.set(geofence.center);
      }
    });
  }

  protected pick(point: ZonePoint): void {
    if (this.shape() === 'polygon') {
      this.polygon.update(points => [...points, point]);
    } else {
      this.center.set(point);
    }
  }

  protected undo(): void {
    this.polygon.update(points => points.slice(0, -1));
  }

  protected clear(): void {
    this.polygon.set([]);
    this.center.set(null);
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.shapeMissing()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input: GeofenceInput = {
      name: value.name,
      kind: value.kind,
      speedLimitKph: value.speedLimitKph,
      ...(this.shape() === 'polygon'
        ? { polygon: this.polygon().map(({ latitude, longitude }) => ({ latitude, longitude })) }
        : { center: this.center(), radiusMeters: value.radiusMeters }),
    };
    this.saving.set(true);
    const id = this.id();
    const saved = id
      ? await this.notifier.track(this.updateGql.mutate({ id, input }), 'geofences.updated')
      : await this.notifier.track(this.createGql.mutate({ input }), 'geofences.created');
    this.saving.set(false);
    if (saved) {
      void this.router.navigate(['/geofences']);
    }
  }

  protected cancel(): void {
    void this.router.navigate(['/geofences']);
  }
}
