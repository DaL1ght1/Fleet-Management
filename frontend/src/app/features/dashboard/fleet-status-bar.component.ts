import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

export interface FleetSegment {
  key: 'inUse' | 'available' | 'maintenance' | 'inactive';
  value: number;
}

@Component({
  selector: 'app-fleet-status-bar',
  imports: [DecimalPipe, PercentPipe, TranslatePipe],
  template: `
    <div class="bar" role="img" [attr.aria-label]="summary()">
      @for (segment of visible(); track segment.key) {
        <span
          class="segment"
          [attr.data-key]="segment.key"
          [class.dimmed]="hovered() && hovered() !== segment.key"
          [style.flex-grow]="segment.value"
          (pointerenter)="hovered.set(segment.key)"
          (pointerleave)="hovered.set(null)"
        >
          @if (hovered() === segment.key) {
            <span class="tooltip" role="tooltip">
              <strong>{{ segment.value | number }}</strong>
              {{ 'dashboard.segments.' + segment.key | translate }} · {{ segment.value / total() | percent }}
            </span>
          }
        </span>
      }
    </div>
    <ul class="legend">
      @for (segment of segments(); track segment.key) {
        <li
          [class.dimmed]="hovered() && hovered() !== segment.key"
          (pointerenter)="hovered.set(segment.key)"
          (pointerleave)="hovered.set(null)"
        >
          <span class="swatch" [attr.data-key]="segment.key" aria-hidden="true"></span>
          <span class="name">{{ 'dashboard.segments.' + segment.key | translate }}</span>
          <span class="count">{{ segment.value | number }}</span>
          <span class="share">{{ total() ? (segment.value / total() | percent) : '—' }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }

    .bar {
      display: flex;
      gap: 2px;
      block-size: 28px;
      padding: 2px;
      border-radius: 8px;
      background: var(--surface-sunken);
    }

    .segment {
      position: relative;
      flex-basis: 0;
      min-inline-size: 6px;
      border-radius: 4px;
      transition: opacity var(--duration) var(--ease-out);
      cursor: default;
    }

    [data-key='inUse'] {
      background: var(--chart-in-use);
    }

    [data-key='available'] {
      background: var(--chart-available);
    }

    [data-key='maintenance'] {
      background: var(--chart-maintenance);
    }

    [data-key='inactive'] {
      background: var(--chart-inactive);
    }

    .dimmed {
      opacity: 0.35;
    }

    .tooltip {
      position: absolute;
      inset-block-end: calc(100% + 10px);
      inset-inline-start: 50%;
      translate: -50% 0;
      z-index: 2;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-control);
      background: var(--asphalt-900);
      color: #fff;
      font-size: var(--text-sm);
      white-space: nowrap;
      box-shadow: var(--shadow-float);
      pointer-events: none;
    }

    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-3) var(--space-5);
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        column-gap: var(--space-2);
        transition: opacity var(--duration) var(--ease-out);
      }
    }

    .swatch {
      inline-size: 12px;
      block-size: 12px;
      border-radius: 3px;
    }

    .name {
      color: var(--ink-muted);
    }

    .count {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: 700;
    }

    .share {
      grid-column: 2 / -1;
      color: var(--ink-faint);
      font-size: var(--text-xs);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FleetStatusBarComponent {
  readonly segments = input.required<readonly FleetSegment[]>();
  readonly summary = input('');

  protected readonly hovered = signal<FleetSegment['key'] | null>(null);
  protected readonly total = computed(() => this.segments().reduce((sum, segment) => sum + segment.value, 0));
  protected readonly visible = computed(() => this.segments().filter(segment => segment.value > 0));
}
