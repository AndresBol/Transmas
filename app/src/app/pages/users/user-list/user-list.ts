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
import { User, UserRole, userFullName } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/notification.service';
import { UserService } from '../../../core/services/user.service';
import { ConfirmationDialog } from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatSelectModule, MatTableModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly notifications = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly users = signal<User[]>([]);
  readonly search = signal('');
  readonly roleFilter = signal<UserRole | 'ALL'>('ALL');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly updatingId = signal<number | null>(null);
  readonly displayedColumns = ['name', 'contact', 'role', 'status', 'actions'];

  readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    return this.users().filter((user) => {
      const matchesQuery = !query || `${user.firstName} ${user.lastName} ${user.email} ${user.phoneNumber}`
        .toLowerCase().includes(query);
      return matchesQuery && (role === 'ALL' || user.role === role);
    });
  });

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.userService.list().subscribe({
      next: ({ data }) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.error.set('Users could not be loaded.'); this.loading.set(false); },
    });
  }

  clearFilters(): void { this.search.set(''); this.roleFilter.set('ALL'); }
  fullName(user: User): string { return userFullName(user); }
  roleLabel(role: UserRole): string { return role === 'ADMIN' ? 'Administrator' : role === 'PROFESSIONAL' ? 'Professional' : 'Client'; }

  confirmStatusChange(user: User): void {
    const nextBlocked = !user.isBlocked;
    this.dialog.open(ConfirmationDialog, {
      data: {
        title: nextBlocked ? 'Deactivate user' : 'Activate user',
        message: `${nextBlocked ? 'Deactivate' : 'Activate'} ${this.fullName(user)}? This change can be reversed.`,
        confirmLabel: nextBlocked ? 'Deactivate' : 'Activate',
      },
    }).afterClosed().subscribe((confirmed) => { if (confirmed) this.updateStatus(user, nextBlocked); });
  }

  private updateStatus(user: User, isBlocked: boolean): void {
    this.updatingId.set(user.id);
    this.userService.updateStatus(user.id, isBlocked).subscribe({
      next: ({ data }) => {
        this.users.update((users) => users.map((item) => item.id === data.id ? data : item));
        this.updatingId.set(null);
        this.notifications.success(`User ${isBlocked ? 'deactivated' : 'activated'} successfully.`);
      },
      error: () => { this.updatingId.set(null); },
    });
  }
}
