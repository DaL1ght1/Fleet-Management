import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-load-state',
  imports: [MatProgressSpinnerModule, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    @if (loading()) {
      <div class="state"><mat-spinner diameter="40" /></div>
    } @else if (failed()) {
      <div class="state">
        <mat-icon class="empty-icon">cloud_off</mat-icon>
        <p>{{ 'common.loadFailed' | translate }}</p>
        <button mat-stroked-button (click)="retry.emit()">{{ 'common.retry' | translate }}</button>
      </div>
    } @else if (empty()) {
      <div class="state">
        <mat-icon class="empty-icon">{{ emptyIcon() }}</mat-icon>
        <p>{{ emptyMessage() }}</p>
        <ng-content select="[emptyAction]" />
      </div>
    } @else {
      <ng-content />
    }
  `,
  styles: `
    .state {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      padding: var(--space-12) var(--space-4);
      border: 1px dashed var(--line-strong);
      border-radius: var(--radius-surface);
      color: var(--ink-muted);
      text-align: center;
    }

    .empty-icon {
      inline-size: 48px;
      block-size: 48px;
      font-size: 28px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: var(--surface-sunken);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadStateComponent {
  readonly loading = input(false);
  readonly failed = input(false);
  readonly empty = input(false);
  readonly emptyMessage = input('');
  readonly emptyIcon = input('inbox');
  readonly retry = output();
}
