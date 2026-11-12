import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BrandMarkComponent } from '../../shared/ui/brand-mark/brand-mark.component';
import { PreferenceControlsComponent } from '../preference-controls/preference-controls.component';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, TranslatePipe, BrandMarkComponent, PreferenceControlsComponent],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {}
