import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  LocationInput,
  TripDetailsFragment,
  TripGQL,
  TripResourceOptionsGQL,
  TripType,
  UpdateTripPlanGQL,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { LocationPickerComponent } from '../../../shared/map/location-picker.component';
import { DateTimeFieldComponent } from '../../../shared/forms/date-time-field.component';
import { GeoLocation } from '../../../shared/map/geo-location';
import { fromDateTimeInput, toDateTimeInput } from '../../../shared/util/date-input';
import { TRIP_TYPES } from '../trip-options';

const scheduleOrder = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('scheduledStart')?.value as string;
  const end = group.get('scheduledEnd')?.value as string;
  return start && end && new Date(end) <= new Date(start) ? { scheduleOrder: true } : null;
};

const toLocationInput = (location: GeoLocation): LocationInput => ({
  latitude: location.latitude,
  longitude: location.longitude,
  address: location.address,
  city: location.city ?? null,
  state: location.state ?? null,
  zipCode: location.zipCode ?? null,
});

@Component({
  selector: 'app-trip-form-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    PageHeaderComponent,
    LocationPickerComponent,
    DateTimeFieldComponent,
  ],
  templateUrl: './trip-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripFormPage {
  readonly id = input.required<string>();

  protected readonly types = TRIP_TYPES;
  protected readonly saving = signal(false);
  protected readonly startLocation = signal<GeoLocation | null>(null);
  protected readonly endLocation = signal<GeoLocation | null>(null);
  protected readonly waypoints = signal<readonly GeoLocation[]>([]);
  protected readonly pendingWaypoint = signal<GeoLocation | null>(null);
  protected readonly submitted = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly tripGql = inject(TripGQL);
  private readonly optionsGql = inject(TripResourceOptionsGQL);
  private readonly updateGql = inject(UpdateTripPlanGQL);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group(
    {
      type: ['RENTAL' as TripType, Validators.required],
      vehicleId: ['', Validators.required],
      driverId: [''],
      scheduledStart: ['', Validators.required],
      scheduledEnd: ['', Validators.required],
      estimatedDurationMinutes: [null as number | null, Validators.min(0)],
      baseRate: [null as number | null, Validators.min(0)],
      fuelCost: [null as number | null, Validators.min(0)],
      additionalFees: [null as number | null, Validators.min(0)],
      notes: [''],
      customerNotes: [''],
      internalNotes: [''],
    },
    { validators: scheduleOrder },
  );

  protected readonly options = rxResource({
    stream: () => this.optionsGql.fetch().pipe(map(result => result.data)),
  });

  private readonly existing = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.tripGql.fetch(params).pipe(map(result => result.data.trip)),
  });

  protected readonly locationsMissing = computed(
    () => this.submitted() && (!this.startLocation() || !this.endLocation()),
  );

  constructor() {
    effect(() => {
      const trip = this.existing.value();
      if (trip) {
        this.load(trip);
      }
    });
  }

  protected addWaypoint(): void {
    const waypoint = this.pendingWaypoint();
    if (waypoint) {
      this.waypoints.update(current => [...current, waypoint]);
      this.pendingWaypoint.set(null);
    }
  }

  protected removeWaypoint(index: number): void {
    this.waypoints.update(current => current.filter((_, position) => position !== index));
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    const start = this.startLocation();
    const end = this.endLocation();
    if (this.form.invalid || !start || !end) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const plan = {
      type: value.type,
      vehicleId: value.vehicleId,
      driverId: value.driverId || null,
      startLocation: toLocationInput(start),
      endLocation: toLocationInput(end),
      waypoints: this.waypoints().map(toLocationInput),
      scheduledStart: fromDateTimeInput(value.scheduledStart),
      scheduledEnd: fromDateTimeInput(value.scheduledEnd),
      estimatedDurationMinutes: value.estimatedDurationMinutes,
      costs: { baseRate: value.baseRate, fuelCost: value.fuelCost, additionalFees: value.additionalFees },
      notes: value.notes || null,
      customerNotes: value.customerNotes || null,
      internalNotes: value.internalNotes || null,
    };
    const savedId = (
      await this.notifier.track(this.updateGql.mutate({ id: this.id(), input: plan }), 'trips.rescheduled')
    )?.data?.updateTripPlan.id;
    this.saving.set(false);
    if (savedId) {
      void this.router.navigate(['/trips', savedId]);
    }
  }

  protected cancel(): void {
    void this.router.navigate(['/trips', this.id()]);
  }

  private load(trip: TripDetailsFragment): void {
    this.form.patchValue({
      type: trip.type,
      vehicleId: trip.vehicle.id,
      driverId: trip.driver?.id ?? '',
      scheduledStart: toDateTimeInput(trip.scheduledStart),
      scheduledEnd: toDateTimeInput(trip.scheduledEnd),
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
      baseRate: trip.costs.baseRate,
      fuelCost: trip.costs.fuelCost,
      additionalFees: trip.costs.additionalFees,
      notes: trip.notes ?? '',
      customerNotes: trip.customerNotes ?? '',
      internalNotes: trip.internalNotes ?? '',
    });
    this.startLocation.set(trip.startLocation);
    this.endLocation.set(trip.endLocation);
    this.waypoints.set(trip.waypoints);
  }
}
