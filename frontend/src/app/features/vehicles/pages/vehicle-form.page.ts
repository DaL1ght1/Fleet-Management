import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { DateFieldComponent } from '../../../shared/forms/date-field.component';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import {
  FuelType,
  RegisterVehicleGQL,
  UpdateVehicleGQL,
  VehicleDetailsFragment,
  VehicleGQL,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { todayIsoDate } from '../../../shared/util/date-input';
import { FUEL_TYPES } from '../vehicle-options';

const VIN_PATTERN = /^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/;
const CURRENT_YEAR = new Date().getFullYear();

@Component({
  selector: 'app-vehicle-form-page',
  imports: [
    DateFieldComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  templateUrl: './vehicle-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleFormPage {
  protected readonly today = new Date();
  readonly id = input<string>();

  protected readonly fuelTypes = FUEL_TYPES;
  protected readonly maxYear = CURRENT_YEAR + 1;
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly vehicleGql = inject(VehicleGQL);
  private readonly registerGql = inject(RegisterVehicleGQL);
  private readonly updateGql = inject(UpdateVehicleGQL);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group({
    make: ['', [Validators.required, Validators.maxLength(100)]],
    model: ['', [Validators.required, Validators.maxLength(100)]],
    year: [CURRENT_YEAR, [Validators.required, Validators.min(1950), Validators.max(CURRENT_YEAR + 1)]],
    licensePlate: ['', [Validators.required, Validators.maxLength(32)]],
    vin: ['', [Validators.required, Validators.pattern(VIN_PATTERN)]],
    color: ['', [Validators.required, Validators.maxLength(50)]],
    mileage: [0, [Validators.required, Validators.min(0)]],
    fuelType: ['GASOLINE' as FuelType, Validators.required],
    seatingCapacity: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
    dailyRate: [0, [Validators.required, Validators.min(0)]],
    gpsEnabled: [true],
    lastMaintenanceDate: [todayIsoDate(), Validators.required],
    maintenanceIntervalDays: [180, [Validators.required, Validators.min(1)]],
  });

  private readonly existing = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) =>
      id ? this.vehicleGql.fetch({ id }).pipe(map(result => result.data.vehicle)) : of(null),
  });

  constructor() {
    effect(() => {
      const vehicle = this.existing.value();
      if (vehicle) {
        this.load(vehicle);
      }
    });
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const saved = await (this.editing() ? this.update() : this.register());
    this.saving.set(false);
    if (saved) {
      void this.router.navigate(['/vehicles', saved]);
    }
  }

  protected cancel(): void {
    void this.router.navigate(this.editing() ? ['/vehicles', this.id()] : ['/vehicles']);
  }

  private async register(): Promise<string | null> {
    const result = await this.notifier.track(
      this.registerGql.mutate({ input: this.form.getRawValue() }),
      'vehicles.registered',
    );
    return result?.data?.registerVehicle.id ?? null;
  }

  private async update(): Promise<string | null> {
    const {
      make,
      model,
      year,
      licensePlate,
      color,
      fuelType,
      seatingCapacity,
      dailyRate,
      gpsEnabled,
      maintenanceIntervalDays,
    } = this.form.getRawValue();
    const result = await this.notifier.track(
      this.updateGql.mutate({
        id: this.id()!,
        input: {
          make,
          model,
          year,
          licensePlate,
          color,
          fuelType,
          seatingCapacity,
          dailyRate,
          gpsEnabled,
          maintenanceIntervalDays,
        },
      }),
      'vehicles.updated',
    );
    return result?.data?.updateVehicle.id ?? null;
  }

  private load(vehicle: VehicleDetailsFragment): void {
    this.form.setValue({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      vin: vehicle.vin,
      color: vehicle.color,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      seatingCapacity: vehicle.seatingCapacity,
      dailyRate: vehicle.dailyRate,
      gpsEnabled: vehicle.gpsEnabled,
      lastMaintenanceDate: vehicle.lastMaintenanceDate,
      maintenanceIntervalDays: vehicle.maintenanceIntervalDays,
    });
    this.form.controls.vin.disable();
    this.form.controls.mileage.disable();
    this.form.controls.lastMaintenanceDate.disable();
  }
}
