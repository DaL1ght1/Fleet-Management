import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

export interface PromptDialogData {
  title: string;
  label: string;
  confirmLabel: string;
}

@Component({
  selector: 'app-prompt-dialog',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ data.label }}</mat-label>
        <textarea matInput rows="3" [ngModel]="value()" (ngModelChange)="value.set($event)" cdkFocusInitial></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">{{ 'common.cancel' | translate }}</button>
      <button mat-flat-button [disabled]="!value().trim()" [mat-dialog-close]="value().trim()">
        {{ data.confirmLabel }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .full-width {
      inline-size: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptDialogComponent {
  protected readonly data = inject<PromptDialogData>(MAT_DIALOG_DATA);
  protected readonly value = signal('');
}
