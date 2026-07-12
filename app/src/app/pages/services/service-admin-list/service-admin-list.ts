import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { Modality, TransportationService } from '../../../core/models/transportation-service.model';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';
import {
  ConfirmationDialog,
  ConfirmationDialogData,
} from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-service-admin-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './service-admin-list.html',
  styleUrl: './service-admin-list.css',
})
export class ServiceAdminList {
  private readonly serviceApi = inject(TransportationServiceService);
  private readonly categoryService = inject(CategoryService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  services = signal<TransportationService[]>([]);
  categories = signal<Category[]>([]);
  search = signal('');
  categoryId = signal<number | null>(null);
  modality = signal<Modality | null>(null);
  availability = signal<boolean | null>(null);
  minimumPrice = signal<number | null>(null);
  maximumPrice = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  updatingId = signal<number | null>(null);

  displayedColumns = ['service', 'professional', 'category', 'modality', 'price', 'status', 'actions'];

  filteredServices = computed(() => {
    const text = this.search().trim().toLowerCase();
    const categoryId = this.categoryId();
    const modality = this.modality();
    const availability = this.availability();
    const minimum = this.minimumPrice();
    const maximum = this.maximumPrice();

    return this.services().filter((service) => {
      const user = service.professionalProfile?.professional;
      const searchable = [
        service.name,
        service.description,
        service.category?.name,
        service.professionalProfile?.professionalTitle,
        user?.firstName,
        user?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const price = Number(service.price);
      return (
        (!text || searchable.includes(text)) &&
        (categoryId === null || service.categoryId === categoryId) &&
        (modality === null || service.modality === modality) &&
        (availability === null || service.isAvailable === availability) &&
        (minimum === null || minimum === undefined || price >= Number(minimum)) &&
        (maximum === null || maximum === undefined || price <= Number(maximum))
      );
    });
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ services: this.serviceApi.list(), categories: this.categoryService.list() }).subscribe({
      next: ({ services, categories }) => {
        this.services.set(services.data ?? []);
        this.categories.set(categories.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Service administration could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.modality.set(null);
    this.availability.set(null);
    this.minimumPrice.set(null);
    this.maximumPrice.set(null);
  }

  confirmAvailability(service: TransportationService): void {
    const isAvailable = !service.isAvailable;
    const data: ConfirmationDialogData = {
      title: isAvailable ? 'Reactivate service' : 'Make service unavailable',
      message: isAvailable
        ? `Make "${service.name}" available in the catalog again?`
        : `Hide "${service.name}" from the public catalog? It can be reactivated later.`,
      confirmLabel: isAvailable ? 'Reactivate' : 'Make unavailable',
      cancelLabel: 'Cancel',
    };

    this.dialog.open(ConfirmationDialog, { data }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.updateAvailability(service, isAvailable);
      }
    });
  }

  private updateAvailability(service: TransportationService, isAvailable: boolean): void {
    this.updatingId.set(service.id);
    this.serviceApi.updateAvailability(service.id, isAvailable).subscribe({
      next: (response) => {
        this.services.update((items) =>
          items.map((item) => (item.id === service.id ? { ...item, ...response.data } : item)),
        );
        this.updatingId.set(null);
        this.notificationService.success(
          isAvailable ? 'The service is available again' : 'The service is now unavailable',
        );
      },
      error: () => {
        this.updatingId.set(null);
        this.notificationService.error('The service availability could not be updated');
      },
    });
  }

  professionalName(service: TransportationService): string {
    const user = service.professionalProfile?.professional;
    return user ? `${user.firstName} ${user.lastName}`.trim() : service.professionalProfile?.professionalTitle ?? 'Unassigned';
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('en-CR', {
      style: 'currency', currency: 'CRC', maximumFractionDigits: 0,
    }).format(Number(value));
  }

  modalityLabel(value: Modality): string {
    return value === 'VIRTUAL' ? 'Virtual' : 'In person';
  }
}
