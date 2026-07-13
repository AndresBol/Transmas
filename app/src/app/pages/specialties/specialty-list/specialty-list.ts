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
import { Specialty } from '../../../core/models/specialty.model';
import { NotificationService } from '../../../core/services/notification.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-specialty-list',
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
  templateUrl: './specialty-list.html',
  styleUrl: './specialty-list.css',
})
export class SpecialtyList implements OnInit {
  private readonly service = inject(SpecialtyService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly items = signal<Specialty[]>([]);
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
        this.error.set('Specialties could not be loaded.');
        this.loading.set(false);
      },
    });
  }
  clearFilters(): void {
    this.search.set('');
    this.availability.set('ALL');
  }
  confirmChange(item: Specialty): void {
    const next = !item.isAvailable;
    this.dialog
      .open(ConfirmationDialog, {
        data: {
          title: `${next ? 'Activate' : 'Deactivate'} specialty`,
          message: `${next ? 'Make' : 'Mark'} "${item.name}" ${next ? 'available' : 'unavailable'}? This change can be reversed.`,
          confirmLabel: next ? 'Activate' : 'Deactivate',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.update(item, next);
      });
  }
  private update(item: Specialty, isAvailable: boolean): void {
    this.updatingId.set(item.id);
    this.service.updateAvailability(item.id, isAvailable).subscribe({
      next: ({ data }) => {
        this.items.update((items) =>
          items.map((current) => (current.id === data.id ? data : current)),
        );
        this.updatingId.set(null);
        this.notifications.success(
          `Specialty ${isAvailable ? 'activated' : 'deactivated'} successfully.`,
        );
      },
      error: () => this.updatingId.set(null),
    });
  }
}
