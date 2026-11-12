import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'signal';

const TONES: Record<string, Tone> = {
  ACTIVE: 'success',
  COMPLETED: 'success',
  PAID: 'success',
  UNPAID: 'warning',
  IN_PROGRESS: 'signal',
  SCHEDULED: 'info',
  ISSUED: 'info',
  DRAFT: 'neutral',
  MAINTENANCE: 'warning',
  ON_LEAVE: 'warning',
  OVERDUE: 'danger',
  INACTIVE: 'neutral',
  CANCELLED: 'neutral',
  VOID: 'neutral',
  SUSPENDED: 'danger',
  LOW: 'neutral',
  MEDIUM: 'info',
  HIGH: 'warning',
  CRITICAL: 'danger',
};

@Component({
  selector: 'app-status-chip',
  imports: [TranslatePipe],
  template: `<span class="chip" [attr.data-tone]="tone()"
    ><span class="dot"></span>{{ prefix() + status() | translate }}</span
  >`,
  styleUrl: './status-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  readonly status = input.required<string>();
  readonly prefix = input('status.');
  protected readonly tone = computed(() => TONES[this.status()] ?? 'neutral');
}
