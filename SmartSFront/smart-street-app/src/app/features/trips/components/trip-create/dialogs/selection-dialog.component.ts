import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface SelectionItem {
  id: any;
  primary: string;
  secondary?: string;
  icon?: string;
  badge?: string;
}

export interface SelectionDialogData {
  title: string;
  items: SelectionItem[];
  selectedId?: any;
}

@Component({
  selector: 'app-selection-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="selection-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.title }}</h2>
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="search-box" *ngIf="data.items.length > 5">
          <mat-icon>search</mat-icon>
          <input 
            type="text" 
            placeholder="Search..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            class="search-input">
        </div>

        <div class="items-list">
          <div 
            *ngFor="let item of filteredItems"
            class="item-card"
            [class.selected]="item.id === selectedId"
            (click)="selectItem(item)">
            
            <div class="item-icon" *ngIf="item.icon">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            
            <div class="item-content">
              <div class="item-primary">{{ item.primary }}</div>
              <div class="item-secondary" *ngIf="item.secondary">{{ item.secondary }}</div>
            </div>
            
            <div class="item-badge" *ngIf="item.badge">
              <span class="badge" [class]="'badge-' + item.badge.toLowerCase()">
                {{ item.badge }}
              </span>
            </div>
            
            <mat-icon class="check-icon" *ngIf="item.id === selectedId">check_circle</mat-icon>
          </div>

          <div class="empty-state" *ngIf="filteredItems.length === 0">
            <mat-icon>search_off</mat-icon>
            <p>No items found</p>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="selectedId" [disabled]="!selectedId">
          Confirm Selection
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .selection-dialog {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--color-border);
    }

    .dialog-header h2 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    .close-btn {
      margin-right: calc(var(--space-2) * -1);
    }

    mat-dialog-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: var(--space-4) var(--space-6);
      gap: var(--space-4);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-background-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      transition: all 0.2s ease;
    }

    .search-box:focus-within {
      border-color: var(--color-primary-300);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-box mat-icon {
      color: var(--color-text-secondary);
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-size: var(--font-size-base);
      color: var(--color-text-primary);
    }

    .search-input::placeholder {
      color: var(--color-text-tertiary);
    }

    .items-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding: var(--space-1) 0;
    }

    .item-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--color-background-secondary);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .item-card:hover {
      background: var(--color-background);
      border-color: var(--color-primary-200);
      transform: translateX(4px);
    }

    .item-card.selected {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-color: var(--color-primary-400);
      box-shadow: var(--shadow-sm);
    }

    .item-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: var(--radius-lg);
      color: white;
    }

    .item-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .item-primary {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .item-secondary {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
    }

    .item-badge {
      margin-left: auto;
    }

    .badge {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-active, .badge-available {
      background: rgba(34, 197, 94, 0.15);
      color: #16a34a;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .badge-inactive, .badge-unavailable {
      background: rgba(239, 68, 68, 0.15);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .badge-scheduled, .badge-maintenance {
      background: rgba(245, 158, 11, 0.15);
      color: #d97706;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .check-icon {
      color: var(--color-primary-600);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-8);
      color: var(--color-text-tertiary);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    mat-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--color-border);
    }

    mat-dialog-actions button {
      min-width: 120px;
    }

    /* Scrollbar styling */
    .items-list::-webkit-scrollbar {
      width: 8px;
    }

    .items-list::-webkit-scrollbar-track {
      background: var(--color-background-secondary);
      border-radius: var(--radius-md);
    }

    .items-list::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: var(--radius-md);
    }

    .items-list::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-tertiary);
    }
  `]
})
export class SelectionDialogComponent {
  searchQuery = '';
  filteredItems: SelectionItem[];
  selectedId: any;

  constructor(
    public dialogRef: MatDialogRef<SelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectionDialogData
  ) {
    this.filteredItems = data.items;
    this.selectedId = data.selectedId;
  }

  onSearch() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredItems = this.data.items;
      return;
    }

    this.filteredItems = this.data.items.filter(item =>
      item.primary.toLowerCase().includes(query) ||
      item.secondary?.toLowerCase().includes(query)
    );
  }

  selectItem(item: SelectionItem) {
    this.selectedId = item.id;
    // Auto-close on selection for better UX
    setTimeout(() => {
      this.dialogRef.close(this.selectedId);
    }, 200);
  }
}
