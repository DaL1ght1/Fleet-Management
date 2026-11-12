import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  CancelWorkOrderGQL,
  CompleteWorkOrderGQL,
  StartWorkOrderGQL,
  WorkOrderGQL,
  WorkOrderStatus,
} from '../../../core/graphql/generated';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { KIND_ICONS } from '../maintenance-options';

const STAGES: readonly WorkOrderStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

@Component({
  selector: 'app-work-order-detail-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslatePipe,
    LoadStateComponent,
    PageHeaderComponent,
    StatusChipComponent,
    MoneyPipe,
  ],
  templateUrl: './work-order-detail.page.html',
  styleUrl: './work-order-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrderDetailPage {
  readonly id = input.required<string>();

  protected readonly stages = STAGES;
  protected readonly kindIcons = KIND_ICONS;
  protected readonly busy = signal(false);

  private readonly workOrderGql = inject(WorkOrderGQL);
  private readonly startGql = inject(StartWorkOrderGQL);
  private readonly completeGql = inject(CompleteWorkOrderGQL);
  private readonly cancelGql = inject(CancelWorkOrderGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);

  protected readonly completion = inject(NonNullableFormBuilder).group({
    partsCost: [null as number | null, Validators.min(0)],
    laborCost: [null as number | null, Validators.min(0)],
    odometerKm: [null as number | null, Validators.min(0)],
    resolutionNotes: [''],
  });

  protected readonly workOrder = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.workOrderGql.fetch(params).pipe(map(result => result.data.workOrder)),
  });

  protected readonly stageIndex = computed(() => STAGES.indexOf(this.workOrder.value()?.status ?? 'SCHEDULED'));

  protected async start(): Promise<void> {
    await this.run(this.startGql.mutate({ id: this.id() }), 'maintenance.started');
  }

  protected async complete(): Promise<void> {
    if (this.completion.invalid) {
      this.completion.markAllAsTouched();
      return;
    }
    const value = this.completion.getRawValue();
    await this.run(
      this.completeGql.mutate({
        id: this.id(),
        input: { ...value, resolutionNotes: value.resolutionNotes.trim() || null },
      }),
      'maintenance.completed',
    );
  }

  protected async cancel(): Promise<void> {
    const reason = await this.confirm.prompt(
      'maintenance.cancelTitle',
      'maintenance.cancelReason',
      'maintenance.cancel',
    );
    if (reason) {
      await this.run(this.cancelGql.mutate({ id: this.id(), reason }), 'maintenance.cancelled');
    }
  }

  private async run(operation: Parameters<Notifier['track']>[0], successKey: string): Promise<void> {
    this.busy.set(true);
    if (await this.notifier.track(operation, successKey)) {
      this.workOrder.reload();
    }
    this.busy.set(false);
  }
}
