import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { GeoLocation } from './geo-location';
import { GeocodingService } from './geocoding.service';
import { createMap, fitTo, marker } from './leaflet-map';

@Component({
  selector: 'app-location-picker',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    TranslatePipe,
  ],
  templateUrl: './location-picker.component.html',
  styleUrl: './location-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPickerComponent {
  readonly label = input.required<string>();
  readonly location = model<GeoLocation | null>(null);

  protected readonly query = signal('');
  protected readonly results = signal<readonly GeoLocation[]>([]);
  protected readonly searching = signal(false);

  private readonly geocoding = inject(GeocodingService);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly leafletMap = signal<L.Map | null>(null);
  private readonly layer = L.layerGroup();

  constructor() {
    afterNextRender(() => {
      const created = createMap(this.host().nativeElement);
      this.layer.addTo(created);
      created.on('click', event => void this.pickAt(event.latlng.lat, event.latlng.lng));
      this.leafletMap.set(created);
    });
    inject(DestroyRef).onDestroy(() => this.leafletMap()?.remove());
    effect(() => this.render());
  }

  protected async search(): Promise<void> {
    const text = this.query().trim();
    if (!text) {
      return;
    }
    this.searching.set(true);
    try {
      this.results.set(await firstValueFrom(this.geocoding.search(text)));
    } finally {
      this.searching.set(false);
    }
  }

  protected choose(result: GeoLocation): void {
    this.location.set(result);
    this.results.set([]);
  }

  private async pickAt(latitude: number, longitude: number): Promise<void> {
    this.location.set({ latitude, longitude, address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` });
    this.location.set(await firstValueFrom(this.geocoding.reverse(latitude, longitude)));
  }

  private render(): void {
    const leafletMap = this.leafletMap();
    const selected = this.location();
    if (!leafletMap) {
      return;
    }
    this.layer.clearLayers();
    if (selected) {
      marker(selected, 'selected').addTo(this.layer);
      fitTo(leafletMap, [selected]);
    }
  }
}
