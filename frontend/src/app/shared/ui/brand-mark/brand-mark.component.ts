import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#1f2830" />
      <path
        d="M34 9 C 12 9, 12 24, 24 24 S 36 39, 14 39"
        fill="none"
        stroke="#3c4955"
        stroke-width="9"
        stroke-linecap="round"
      />
      <path
        d="M34 9 C 12 9, 12 24, 24 24 S 36 39, 14 39"
        fill="none"
        stroke="#ffc233"
        stroke-width="2.2"
        stroke-dasharray="4 3.2"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {
  readonly size = input(40);
}
