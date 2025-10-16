import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractiveMapComponent } from '../shared/components/interactive-map/interactive-map.component';

@Component({
  selector: 'app-map-test',
  standalone: true,
  imports: [CommonModule, InteractiveMapComponent],
  template: `
    <div style="padding: 20px;">
      <h1>Map Test Page</h1>
      <p>Testing the interactive map component:</p>
      
      <div style="border: 1px solid #ccc; padding: 20px; margin: 20px 0;">
        <app-interactive-map
          (locationSelected)="onLocationSelected($event)"
          (locationRemoved)="onLocationRemoved($event)">
        </app-interactive-map>
      </div>
      
      <div *ngIf="lastEvent" style="margin-top: 20px;">
        <h3>Last Event:</h3>
        <pre>{{ lastEvent | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    pre {
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class MapTestComponent {
  lastEvent: any = null;

  onLocationSelected(event: any) {
    console.log('Location selected:', event);
    this.lastEvent = { type: 'selected', event };
  }

  onLocationRemoved(event: any) {
    console.log('Location removed:', event);
    this.lastEvent = { type: 'removed', event };
  }
}