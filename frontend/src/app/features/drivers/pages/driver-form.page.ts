import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DateFieldComponent } from '../../../shared/forms/date-field.component';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import {
  DriverDetailsFragment,
  DriverGQL,
  EmergencyContactInput,
  RegisterDriverGQL,
  UpdateDriverGQL,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { todayIsoDate } from '../../../shared/util/date-input';

const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-driver-form-page',
  imports: [
    DateFieldComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  templateUrl: './driver-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverFormPage {
  protected readonly today = new Date();
  readonly id = input<string>();

  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly driverGql = inject(DriverGQL);
  private readonly registerGql = inject(RegisterDriverGQL);
  private readonly updateGql = inject(UpdateDriverGQL);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    licenseNumber: ['', [Validators.required, Validators.maxLength(60)]],
    licenseExpiryDate: ['', Validators.required],
    dateOfBirth: [''],
    hireDate: [todayIsoDate()],
    monthlySalary: [null as number | null, Validators.min(0)],
    accountId: ['', Validators.pattern(UUID_PATTERN)],
    emergencyContactName: [''],
    emergencyContactPhone: ['', Validators.pattern(PHONE_PATTERN)],
  });

  private readonly existing = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) => (id ? this.driverGql.fetch({ id }).pipe(map(result => result.data.driver)) : of(null)),
  });

  constructor() {
    effect(() => {
      const driver = this.existing.value();
      if (driver) {
        this.load(driver);
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
      void this.router.navigate(['/drivers', saved]);
    }
  }

  protected cancel(): void {
    void this.router.navigate(this.editing() ? ['/drivers', this.id()] : ['/drivers']);
  }

  private async register(): Promise<string | null> {
    const value = this.form.getRawValue();
    const result = await this.notifier.track(
      this.registerGql.mutate({
        input: {
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          phoneNumber: value.phoneNumber,
          licenseNumber: value.licenseNumber,
          licenseExpiryDate: value.licenseExpiryDate,
          dateOfBirth: value.dateOfBirth || null,
          hireDate: value.hireDate || null,
          monthlySalary: value.monthlySalary,
          accountId: value.accountId || null,
          emergencyContact: this.emergencyContact(),
        },
      }),
      'drivers.registered',
    );
    return result?.data?.registerDriver.id ?? null;
  }

  private async update(): Promise<string | null> {
    const value = this.form.getRawValue();
    const result = await this.notifier.track(
      this.updateGql.mutate({
        id: this.id()!,
        input: {
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          phoneNumber: value.phoneNumber,
          licenseNumber: value.licenseNumber,
          licenseExpiryDate: value.licenseExpiryDate,
          dateOfBirth: value.dateOfBirth || null,
          hireDate: value.hireDate || null,
          monthlySalary: value.monthlySalary,
          accountId: value.accountId || null,
          emergencyContact: this.emergencyContact(),
        },
      }),
      'drivers.updated',
    );
    return result?.data?.updateDriver.id ?? null;
  }

  private emergencyContact(): EmergencyContactInput | null {
    const { emergencyContactName, emergencyContactPhone } = this.form.getRawValue();
    return emergencyContactName && emergencyContactPhone
      ? { name: emergencyContactName, phoneNumber: emergencyContactPhone }
      : null;
  }

  private load(driver: DriverDetailsFragment): void {
    this.form.setValue({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber,
      licenseExpiryDate: driver.licenseExpiryDate,
      dateOfBirth: driver.dateOfBirth ?? '',
      hireDate: driver.hireDate,
      monthlySalary: driver.monthlySalary,
      accountId: driver.accountId ?? '',
      emergencyContactName: driver.emergencyContact?.name ?? '',
      emergencyContactPhone: driver.emergencyContact?.phoneNumber ?? '',
    });
  }
}
