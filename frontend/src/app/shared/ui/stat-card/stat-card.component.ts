import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type StatTone = 'neutral' | 'accent' | 'warning' | 'danger' | 'signal';

@Component({
  selector: 'app-stat-card',
  imports: [MatIconModule],
  template: `
    <article class="stat" [attr.data-tone]="tone()">
      <header>
        <span class="label">{{ label() }}</span>
        <mat-icon class="icon" aria-hidden="true">{{ icon() }}</mat-icon>
      </header>
      <p class="value">{{ value() }}</p>
      @if (hint(); as text) {
        <p class="hint">{{ text }}</p>
      }
    </article>
  `,
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>();
  readonly tone = input<StatTone>('neutral');
}
