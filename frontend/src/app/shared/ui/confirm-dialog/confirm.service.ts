import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { PromptDialogComponent, PromptDialogData } from '../prompt-dialog/prompt-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  async confirm(titleKey: string, messageKey: string, confirmKey: string, destructive = false): Promise<boolean> {
    const data: ConfirmDialogData = {
      title: this.translate.instant(titleKey),
      message: this.translate.instant(messageKey),
      confirmLabel: this.translate.instant(confirmKey),
      destructive,
    };
    const result = await firstValueFrom(
      this.dialog.open(ConfirmDialogComponent, { data, width: '420px', maxWidth: '94vw' }).afterClosed(),
    );
    return result === true;
  }

  async prompt(titleKey: string, labelKey: string, confirmKey: string): Promise<string | null> {
    const data: PromptDialogData = {
      title: this.translate.instant(titleKey),
      label: this.translate.instant(labelKey),
      confirmLabel: this.translate.instant(confirmKey),
    };
    const result = await firstValueFrom(
      this.dialog
        .open<PromptDialogComponent, PromptDialogData, string | null>(PromptDialogComponent, {
          data,
          width: '480px',
          maxWidth: '94vw',
        })
        .afterClosed(),
    );
    return result ?? null;
  }
}
