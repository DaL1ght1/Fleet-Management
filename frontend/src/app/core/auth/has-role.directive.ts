import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from './auth.service';
import { AppRole } from './roles';

@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  readonly appHasRole = input.required<readonly AppRole[]>();

  private readonly auth = inject(AuthService);
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.container.clear();
      if (this.auth.hasAnyRole(this.appHasRole())) {
        this.container.createEmbeddedView(this.template);
      }
    });
  }
}
