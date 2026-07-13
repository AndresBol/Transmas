import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly service = inject(CategoryService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly items = signal<Category[]>([]);
  readonly search = signal('');
  readonly availability = signal<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('ALL');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly updatingId = signal<number | null>(null);
  readonly displayedColumns = ['name', 'description', 'status', 'actions'];
  readonly filteredItems = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.items().filter(
      (item) =>
        (!query || `${item.name} ${item.description}`.toLowerCase().includes(query)) &&
        (this.availability() === 'ALL' ||
          item.isAvailable === (this.availability() === 'AVAILABLE')),
    );
  });
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
      next: ({ data }) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Categories could not be loaded.');
        this.loading.set(false);
      },
    });
  }
  clearFilters(): void {
    this.search.set('');
    this.availability.set('ALL');
  }
  confirmChange(item: Category): void {
    const next = !item.isAvailable;
    this.dialog
      .open(ConfirmationDialog, {
        data: {
          title: `${next ? 'Activate' : 'Deactivate'} category`,
          message: `${next ? 'Make' : 'Mark'} "${item.name}" ${next ? 'available' : 'unavailable'}? This change can be reversed.`,
          confirmLabel: next ? 'Activate' : 'Deactivate',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.update(item, next);
      });
  }
  private update(item: Category, isAvailable: boolean): void {
    this.updatingId.set(item.id);
    this.service.updateAvailability(item.id, isAvailable).subscribe({
      next: ({ data }) => {
        this.items.update((items) =>
          items.map((current) => (current.id === data.id ? data : current)),
        );
        this.updatingId.set(null);
        this.notifications.success(
          `Category ${isAvailable ? 'activated' : 'deactivated'} successfully.`,
        );
      },
      error: () => this.updatingId.set(null),
    });
  }
}
