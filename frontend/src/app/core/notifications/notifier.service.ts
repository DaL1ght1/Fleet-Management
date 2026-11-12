import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, firstValueFrom } from 'rxjs';
import { graphQlErrorMessage } from '../graphql/graphql-error';

const SUCCESS_DURATION_MS = 3000;
const ERROR_DURATION_MS = 6000;

@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  success(messageKey: string): void {
    this.snackBar.open(this.translate.instant(messageKey), undefined, {
      duration: SUCCESS_DURATION_MS,
      panelClass: 'snack-success',
    });
  }

  error(message: string): void {
    this.snackBar.open(message, this.translate.instant('common.dismiss'), {
      duration: ERROR_DURATION_MS,
      panelClass: 'snack-error',
    });
  }

  errorKey(messageKey: string): void {
    this.error(this.translate.instant(messageKey));
  }

  async track<T>(operation: Observable<T>, successKey: string): Promise<T | null> {
    try {
      const result = await firstValueFrom(operation);
      this.success(successKey);
      return result;
    } catch (failure) {
      const message = graphQlErrorMessage(failure);
      if (message) {
        this.error(message);
      }
      return null;
    }
  }
}
