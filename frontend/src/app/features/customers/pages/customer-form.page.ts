import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map, of } from 'rxjs';
import {
  CustomerGQL,
  DeleteCustomerGQL,
  RegisterCustomerGQL,
  UpdateCustomerGQL,
} from '../../../core/graphql/generated';
import { HasRoleDirective } from '../../../core/auth/has-role.directive';
import { Roles } from '../../../core/auth/roles';
import { Notifier } from '../../../core/notifications/notifier.service';
import { ConfirmService } from '../../../shared/ui/confirm-dialog/confirm.service';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';

const PHONE_PATTERN = /^\+?[0-9 ()-]{6,20}$/;

@Component({
  selector: 'app-customer-form-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    HasRoleDirective,
    PageHeaderComponent,
  ],
  templateUrl: './customer-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerFormPage {
  readonly id = input<string>();

  protected readonly roles = Roles;
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly customerGql = inject(CustomerGQL);
  private readonly registerGql = inject(RegisterCustomerGQL);
  private readonly updateGql = inject(UpdateCustomerGQL);
  private readonly deleteGql = inject(DeleteCustomerGQL);
  private readonly notifier = inject(Notifier);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  protected readonly form = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.maxLength(60)]],
    lastName: ['', [Validators.required, Validators.maxLength(60)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.pattern(PHONE_PATTERN)],
  });

  private readonly existing = rxResource({
    params: () => this.id(),
    stream: ({ params: id }) =>
      id ? this.customerGql.fetch({ id }).pipe(map(result => result.data.customer)) : of(null),
  });

  constructor() {
    effect(() => {
      const customer = this.existing.value();
      if (customer) {
        this.form.setValue({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber ?? '',
        });
      }
    });
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { firstName, lastName, email, phoneNumber } = this.form.getRawValue();
    const input = { firstName, lastName, email, phoneNumber: phoneNumber || null };
    const id = this.id();
    const saved = id
      ? await this.notifier.track(this.updateGql.mutate({ id, input }), 'customers.updated')
      : await this.notifier.track(this.registerGql.mutate({ input }), 'customers.registered');
    this.saving.set(false);
    if (saved) {
      void this.router.navigate(['/customers']);
    }
  }

  protected async remove(): Promise<void> {
    const id = this.id();
    if (
      !id ||
      !(await this.confirm.confirm('customers.deleteTitle', 'customers.deleteMessage', 'common.delete', true))
    ) {
      return;
    }
    if (await this.notifier.track(this.deleteGql.mutate({ id }), 'customers.deleted')) {
      void this.router.navigate(['/customers']);
    }
  }

  protected cancel(): void {
    void this.router.navigate(['/customers']);
  }
}
