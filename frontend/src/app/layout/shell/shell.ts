import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationCenter } from '../../features/notifications/notification-center.service';
import { BrandMarkComponent } from '../../shared/ui/brand-mark/brand-mark.component';
import { PreferenceControlsComponent } from '../preference-controls/preference-controls.component';
import { NAVIGATION } from './navigation';
import { NotificationBellComponent } from './notification-bell.component';

const COMPACT_LAYOUT = '(max-width: 1023px)';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    TranslatePipe,
    BrandMarkComponent,
    PreferenceControlsComponent,
    NotificationBellComponent,
  ],
  providers: [NotificationCenter],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly account = this.auth.account;
  protected readonly displayName = this.auth.displayName;
  protected readonly initials = this.auth.initials;
  protected readonly navigation = computed(() =>
    NAVIGATION.map(group => ({ ...group, items: group.items.filter(item => this.auth.hasAnyRole(item.roles)) })).filter(
      group => group.items.length > 0,
    ),
  );
  protected readonly compact = toSignal(
    inject(BreakpointObserver)
      .observe(COMPACT_LAYOUT)
      .pipe(map(state => state.matches)),
    { initialValue: window.matchMedia(COMPACT_LAYOUT).matches },
  );

  protected signOut(): void {
    void this.auth.signOut();
  }
}
