import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import {
  ChangeDriverStatusGQL,
  DeleteDriverGQL,
  DriverGQL,
  DriverStatus,
  RateDriverGQL,
} from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip/status-chip.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { DRIVER_STATUSES, RATING_SCALE } from '../driver-options';

@Component({
  selector: 'app-driver-detail-page',
  imports: [
    MoneyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
    StatusChipComponent,
    LoadStateComponent,
  ],
  templateUrl: './driver-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DriverDetailPage {
  readonly id = input.required<string>();

  protected readonly roles = Roles;
  protected readonly statuses = DRIVER_STATUSES;
  protected readonly ratingScale = RATING_SCALE;

  private readonly driverGql = inject(DriverGQL);
  private readonly changeStatusGql = inject(ChangeDriverStatusGQL);
  private readonly rateGql = inject(RateDriverGQL);
  private readonly deleteGql = inject(DeleteDriverGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  protected readonly driver = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.driverGql.fetch(params).pipe(map(result => result.data.driver)),
  });

  protected async changeStatus(status: DriverStatus): Promise<void> {
    if (await this.notifier.track(this.changeStatusGql.mutate({ id: this.id(), status }), 'drivers.statusChanged')) {
      this.driver.reload();
    }
  }

  protected async rate(rating: number): Promise<void> {
    if (await this.notifier.track(this.rateGql.mutate({ id: this.id(), rating }), 'drivers.rated')) {
      this.driver.reload();
    }
  }

  protected async remove(): Promise<void> {
    if (!(await this.confirm.confirm('drivers.deleteTitle', 'drivers.deleteMessage', 'common.delete', true))) {
      return;
    }
    if (await this.notifier.track(this.deleteGql.mutate({ id: this.id() }), 'drivers.deleted')) {
      void this.router.navigate(['/drivers']);
    }
  }
}
