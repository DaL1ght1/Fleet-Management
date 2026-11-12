import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

export interface DeviceKeyDialogData {
  apiKey: string;
}

@Component({
  selector: 'app-device-key-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'telemetry.keyTitle' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'telemetry.keyWarning' | translate }}</p>
      <code class="key">{{ data.apiKey }}</code>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="copy()">
        <mat-icon>{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
        {{ (copied() ? 'telemetry.copied' : 'telemetry.copy') | translate }}
      </button>
      <button mat-flat-button mat-dialog-close>{{ 'common.done' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    .key {
      display: block;
      padding: var(--space-3);
      border-radius: var(--radius-control);
      background: var(--surface-sunken);
      font-size: var(--text-sm);
      overflow-wrap: anywhere;
      user-select: all;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceKeyDialogComponent {
  protected readonly data = inject<DeviceKeyDialogData>(MAT_DIALOG_DATA);
  protected readonly copied = signal(false);
  private readonly clipboard = inject(Clipboard);

  protected copy(): void {
    this.copied.set(this.clipboard.copy(this.data.apiKey));
  }
}
