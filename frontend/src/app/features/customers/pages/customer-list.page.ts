import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';
import { CustomersGQL } from '../../../core/graphql/generated';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { LoadStateComponent } from '../../../shared/ui/load-state/load-state.component';
import { debounced } from '../../../shared/util/debounced';

@Component({
  selector: 'app-customer-list-page',
  imports: [
    DatePipe,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    PageHeaderComponent,
    LoadStateComponent,
  ],
  templateUrl: './customer-list.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListPage {
  protected readonly columns = ['name', 'email', 'phoneNumber', 'createdAt'];
  protected readonly search = signal('');
  protected readonly page = signal(0);
  protected readonly size = signal(20);

  private readonly customersGql = inject(CustomersGQL);
  private readonly router = inject(Router);
  private readonly debouncedSearch = debounced(this.search);

  protected readonly customers = rxResource({
    params: () => ({ search: this.debouncedSearch() || null, page: this.page(), size: this.size() }),
    stream: ({ params }) => this.customersGql.fetch(params).pipe(map(result => result.data.customers)),
  });

  protected readonly rows = computed(() => this.customers.value()?.items ?? []);
  protected readonly total = computed(() => this.customers.value()?.totalCount ?? 0);

  protected changeSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
  }

  protected changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
  }

  protected open(id: string): void {
    void this.router.navigate(['/customers', id]);
  }
}
