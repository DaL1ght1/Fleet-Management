import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DateFieldComponent } from '../../../shared/forms/date-field.component';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import {
  MaintenanceVehicleOptionsGQL,
  ScheduleWorkOrderGQL,
  UpdateWorkOrderGQL,
  WorkOrderGQL,
  WorkOrderKind,
  WorkOrderPriority,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { todayIsoDate } from '../../../shared/util/date-input';
import { KIND_ICONS, WORK_ORDER_KINDS, WORK_ORDER_PRIORITIES } from '../maintenance-options';

@Component({
  selector: 'app-work-order-form-page',
  imports: [
    DateFieldComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
    PageHeaderComponent,
  ],
  templateUrl: './work-order-form.page.html',
  styleUrl: './work-order-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderFormPage {
  protected readonly today = new Date();
  readonly id = input<string>();
  readonly vehicleId = input<string>();

  protected readonly kinds = WORK_ORDER_KINDS;
  protected readonly priorities = WORK_ORDER_PRIORITIES;
  protected readonly kindIcons = KIND_ICONS;
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);

  private readonly workOrderGql = inject(WorkOrderGQL);
  private readonly optionsGql = inject(MaintenanceVehicleOptionsGQL);
  private readonly scheduleGql = inject(ScheduleWorkOrderGQL);
  private readonly updateGql = inject(UpdateWorkOrderGQL);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group({
    vehicleId: ['', Validators.required],
    kind: ['REPAIR' as WorkOrderKind, Validators.required],
    priority: ['MEDIUM' as WorkOrderPriority, Validators.required],
    title: ['', [Validators.required, Validators.maxLength(160)]],
    description: [''],
    vendor: ['', Validators.maxLength(160)],
    scheduledFor: [todayIsoDate(), Validators.required],
  });

  protected readonly vehicles = rxResource({
    stream: () => this.optionsGql.fetch().pipe(map(result => result.data.vehicles.items)),
  });

  private readonly existing = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) =>
      id ? this.workOrderGql.fetch({ id }).pipe(map(result => result.data.workOrder)) : of(null),
  });

  constructor() {
    effect(() => {
      const preset = this.vehicleId();
      if (preset && !this.editing()) {
        this.form.controls.vehicleId.setValue(preset);
      }
    });
    effect(() => {
      const order = this.existing.value();
      if (order) {
        this.form.patchValue({
          vehicleId: order.vehicle.id,
          kind: order.kind,
          priority: order.priority,
          title: order.title,
          description: order.description ?? '',
          vendor: order.vendor ?? '',
          scheduledFor: order.scheduledFor,
        });
        this.form.controls.vehicleId.disable();
      }
    });
  }

  protected chooseKind(kind: WorkOrderKind): void {
    this.form.controls.kind.setValue(kind);
  }

  protected async save(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const details = {
      kind: value.kind,
      priority: value.priority,
      title: value.title.trim(),
      description: value.description.trim() || null,
      vendor: value.vendor.trim() || null,
      scheduledFor: value.scheduledFor,
    };
    const id = this.id();
    const savedId = id
      ? (await this.notifier.track(this.updateGql.mutate({ id, input: details }), 'maintenance.updated'))?.data
          ?.updateWorkOrder.id
      : (
          await this.notifier.track(
            this.scheduleGql.mutate({ input: { ...details, vehicleId: value.vehicleId } }),
            'maintenance.scheduled',
          )
        )?.data?.scheduleWorkOrder.id;
    this.saving.set(false);
    if (savedId) {
      void this.router.navigate(['/maintenance', savedId]);
    }
  }

  protected cancel(): void {
    void this.router.navigate(this.editing() ? ['/maintenance', this.id()] : ['/maintenance']);
  }
}
