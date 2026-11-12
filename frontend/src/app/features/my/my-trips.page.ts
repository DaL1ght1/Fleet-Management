import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { MyTripsGQL } from '../../core/graphql/generated';
import { AuthService } from '../../core/auth/auth.service';
import { LoadStateComponent } from '../../shared/ui/load-state/load-state.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/ui/status-chip/status-chip.component';
import { MoneyPipe } from '../../shared/pipes/money.pipe';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-my-trips-page',
  imports: [
    DatePipe,
    DecimalPipe,
    NgTemplateOutlet,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LoadStateComponent,
    PageHeaderComponent,
    StatusChipComponent,
    MoneyPipe,
  ],
  templateUrl: './my-trips.page.html',
  styleUrl: './my-trips.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTripsPage {
  private readonly myTripsGql = inject(MyTripsGQL);
  private readonly auth = inject(AuthService);

  protected readonly size = signal(PAGE_SIZE);
  protected readonly isDriver = computed(() => this.auth.hasAnyRole(['DRIVER']));
  protected readonly firstName = computed(() => this.auth.account()?.firstName ?? '');

  protected readonly trips = rxResource({
    params: () => ({ page: 0, size: this.size() }),
    stream: ({ params }) => this.myTripsGql.fetch(params).pipe(map(result => result.data.myTrips)),
  });

  protected readonly items = computed(() => this.trips.value()?.items ?? []);
  protected readonly upcoming = computed(() =>
    this.items().filter(trip => trip.status === 'SCHEDULED' || trip.status === 'IN_PROGRESS'),
  );
  protected readonly past = computed(() =>
    this.items().filter(trip => trip.status === 'COMPLETED' || trip.status === 'CANCELLED'),
  );

  protected showMore(): void {
    this.size.update(size => size + PAGE_SIZE);
  }
}
