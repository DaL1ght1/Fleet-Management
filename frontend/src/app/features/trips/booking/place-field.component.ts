import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';
import { GeoLocation } from '../../../shared/map/geo-location';
import { GeocodingService, Place } from '../../../shared/map/geocoding.service';
import { debounced } from '../../../shared/util/debounced';

const MIN_QUERY_LENGTH = 3;

function labelOf(place: GeoLocation | Place | null): string {
  if (!place) {
    return '';
  }
  return 'title' in place && place.title ? place.title : place.address;
}

@Component({
  selector: 'app-place-field',
  imports: [
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslatePipe,
  ],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="field" [class.active]="active()">
      <span matPrefix class="pin" [attr.data-kind]="kind()">{{ kind() === 'from' ? 'A' : 'B' }}</span>
      <mat-label>{{ label() }}</mat-label>
      <input
        matInput
        [ngModel]="text()"
        (ngModelChange)="type($event)"
        (focus)="focused.emit()"
        [matAutocomplete]="suggestions"
        [placeholder]="'booking.searchPlaceholder' | translate"
        autocomplete="off"
      />
      @if (locating() || (results.isLoading() && query().length >= minLength)) {
        <mat-spinner matSuffix diameter="18" />
      } @else if (place()) {
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="clear()"
          [attr.aria-label]="'booking.clear' | translate"
        >
          <mat-icon>close</mat-icon>
        </button>
      } @else if (kind() === 'from' && canLocate) {
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="useMyLocation()"
          [matTooltip]="'booking.useMyLocation' | translate"
          [attr.aria-label]="'booking.useMyLocation' | translate"
        >
          <mat-icon>my_location</mat-icon>
        </button>
      }
      <mat-autocomplete #suggestions="matAutocomplete" [displayWith]="display" (optionSelected)="choose($event)">
        @for (option of results.value() ?? []; track option.latitude + ',' + option.longitude) {
          <mat-option [value]="option" class="suggestion">
            <span class="option-title">{{ option.title }}</span>
            @if (option.subtitle) {
              <span class="option-subtitle">{{ option.subtitle }}</span>
            }
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }

    .field {
      inline-size: 100%;

      ::ng-deep .mat-mdc-form-field-infix {
        inline-size: auto;
        min-inline-size: 0;
      }
    }

    .pin {
      display: inline-grid;
      place-items: center;
      inline-size: 26px;
      block-size: 26px;
      margin-inline: var(--space-3) var(--space-2);
      border-radius: 50%;
      background: var(--asphalt-900);
      color: #fff;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: var(--text-sm);

      &[data-kind='to'] {
        background: var(--signal-500);
        color: var(--signal-ink);
      }
    }

    .option-title {
      display: block;
      font-weight: 600;
    }

    .option-subtitle {
      display: block;
      color: var(--ink-muted);
      font-size: var(--text-sm);
      line-height: 1.3;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceFieldComponent {
  readonly label = input.required<string>();
  readonly kind = input.required<'from' | 'to'>();
  readonly near = input<GeoLocation | null>(null);
  readonly active = input(false);
  readonly place = model<GeoLocation | null>(null);
  readonly focused = output();

  protected readonly minLength = MIN_QUERY_LENGTH;
  protected readonly canLocate = 'geolocation' in navigator;
  protected readonly query = signal('');
  protected readonly locating = signal(false);
  protected readonly text = computed(() => this.query() || labelOf(this.place()));
  protected readonly display = (value: Place | string | null): string =>
    typeof value === 'string' ? value : labelOf(value);

  private readonly geocoding = inject(GeocodingService);
  private readonly debouncedQuery = debounced(this.query, 300);

  protected readonly results = rxResource({
    params: () => this.debouncedQuery().trim(),
    stream: ({ params: text }) =>
      text.length >= MIN_QUERY_LENGTH ? this.geocoding.search(text, this.near() ?? undefined) : of<Place[]>([]),
  });

  protected type(value: string | Place): void {
    if (typeof value === 'string') {
      this.query.set(value);
      if (!value) {
        this.place.set(null);
      }
    }
  }

  protected choose(event: MatAutocompleteSelectedEvent): void {
    const option = event.option.value as Place;
    this.place.set(option);
    this.query.set('');
  }

  protected clear(): void {
    this.query.set('');
    this.place.set(null);
  }

  protected useMyLocation(): void {
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        this.place.set(
          await firstValueFrom(this.geocoding.reverse(position.coords.latitude, position.coords.longitude)),
        );
        this.locating.set(false);
      },
      () => this.locating.set(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }
}
