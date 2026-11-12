import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import {
  BookingOptionsGQL,
  LocationInput,
  RequestTripGQL,
  TripQuoteGQL,
  TripType,
} from '../../../core/graphql/generated';
import { AuthService } from '../../../core/auth/auth.service';
import { Roles } from '../../../core/auth/roles';
import { LanguageService } from '../../../core/i18n/language.service';
import { Notifier } from '../../../core/notifications/notifier.service';
import { graphQlErrorMessage } from '../../../core/graphql/graphql-error';
import { GeoLocation } from '../../../shared/map/geo-location';
import { GeocodingService } from '../../../shared/map/geocoding.service';
import { RoutingService } from '../../../shared/map/routing.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { BookingMapComponent, PickedPoint } from '../booking/booking-map.component';
import { DeparturePickerComponent } from '../booking/departure-picker.component';
import { PlaceFieldComponent } from '../booking/place-field.component';
import { TRIP_TYPES } from '../trip-options';

type Field = 'from' | 'to';

function toLocationInput(location: GeoLocation): LocationInput {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address,
    city: location.city ?? null,
    state: location.state ?? null,
    zipCode: location.zipCode ?? null,
  };
}

@Component({
  selector: 'app-trip-booking-page',
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    TranslatePipe,
    PageHeaderComponent,
    MoneyPipe,
    BookingMapComponent,
    DeparturePickerComponent,
    PlaceFieldComponent,
  ],
  templateUrl: './trip-booking.page.html',
  styleUrl: './trip-booking.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripBookingPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly geocoding = inject(GeocodingService);
  private readonly routing = inject(RoutingService);
  private readonly quoteGql = inject(TripQuoteGQL);
  private readonly requestGql = inject(RequestTripGQL);
  private readonly optionsGql = inject(BookingOptionsGQL);

  protected readonly language = inject(LanguageService).current;
  protected readonly types = TRIP_TYPES;
  protected readonly staff = computed(() => this.auth.hasAnyRole(Roles.MANAGEMENT));
  protected readonly backLink = computed(() => (this.staff() ? '/trips' : '/my/trips'));

  protected readonly from = signal<GeoLocation | null>(null);
  protected readonly to = signal<GeoLocation | null>(null);
  protected readonly activeField = signal<Field>('from');
  protected readonly departAt = signal<Date | null>(null);
  protected readonly scheduled = signal(false);
  protected readonly type = signal<TripType>('RENTAL');
  protected readonly vehicleId = signal<string | null>(null);
  protected readonly driverId = signal<string | null>(null);
  protected readonly customerId = signal<string | null>(null);
  protected readonly booking = signal(false);
  protected readonly failure = signal<string | null>(null);

  protected readonly route = rxResource({
    params: () => {
      const from = this.from();
      const to = this.to();
      return from && to ? { from, to } : undefined;
    },
    stream: ({ params }) => this.routing.route(params.from, params.to),
  });

  protected readonly options = rxResource({
    params: () => (this.staff() ? true : undefined),
    stream: () => this.optionsGql.fetch().pipe(map(result => result.data)),
  });

  private readonly request = computed(() => {
    const from = this.from();
    const to = this.to();
    if (!from || !to || (this.scheduled() && !this.departAt()) || this.route.isLoading()) {
      return undefined;
    }
    const route = this.route.value();
    const staff = this.staff();
    return {
      from: toLocationInput(from),
      to: toLocationInput(to),
      departAt: this.scheduled() ? (this.departAt()?.toISOString() ?? null) : null,
      routeDistanceKm: route?.distanceKm ?? null,
      routeDurationMinutes: route?.durationMinutes ?? null,
      type: staff ? this.type() : null,
      vehicleId: staff ? this.vehicleId() : null,
      driverId: staff ? this.driverId() : null,
      customerId: staff ? this.customerId() : null,
    };
  });

  protected readonly quote = rxResource({
    params: () => this.request(),
    stream: ({ params }) =>
      this.quoteGql.fetch({ input: params }).pipe(
        map(result => result.data.tripQuote),
        catchError(() => of(null)),
      ),
  });

  protected readonly missing = computed(() => {
    if (!this.from()) {
      return 'booking.missing.from';
    }
    if (!this.to()) {
      return 'booking.missing.to';
    }
    if (this.scheduled() && !this.departAt()) {
      return 'booking.missing.time';
    }
    return null;
  });

  protected readonly canBook = computed(
    () => !this.missing() && !this.booking() && this.quote.value()?.vehicleAvailable === true,
  );

  protected async pickOnMap(point: PickedPoint): Promise<void> {
    const field = this.activeField();
    const place = await firstValueFrom(this.geocoding.reverse(point.latitude, point.longitude));
    if (field === 'from') {
      this.from.set(place);
      if (!this.to()) {
        this.activeField.set('to');
      }
    } else {
      this.to.set(place);
    }
  }

  protected setFrom(place: GeoLocation | null): void {
    this.from.set(place);
    if (place && !this.to()) {
      this.activeField.set('to');
    }
  }

  protected swap(): void {
    const from = this.from();
    this.from.set(this.to());
    this.to.set(from);
  }

  protected async book(): Promise<void> {
    const input = this.request();
    if (!input || !this.canBook()) {
      return;
    }
    this.booking.set(true);
    this.failure.set(null);
    try {
      const result = await firstValueFrom(this.requestGql.mutate({ input }));
      const id = result.data?.requestTrip.id;
      this.notifier.success('booking.booked');
      await this.router.navigate(this.staff() && id ? ['/trips', id] : ['/my/trips']);
    } catch (error) {
      this.failure.set(graphQlErrorMessage(error) || null);
    } finally {
      this.booking.set(false);
    }
  }
}
