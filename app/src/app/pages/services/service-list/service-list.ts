import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { Modality, TransportationService } from '../../../core/models/transportation-service.model';
import { CategoryService } from '../../../core/services/category.service';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css',
})
export class ServiceList {
  private readonly transportationService = inject(TransportationServiceService);
  private readonly categoryService = inject(CategoryService);

  services = signal<TransportationService[]>([]);
  categories = signal<Category[]>([]);
  search = signal('');
  categoryId = signal<number | null>(null);
  modality = signal<Modality | null>(null);
  minimumPrice = signal<number | null>(null);
  maximumPrice = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  filteredServices = computed(() => {
    const text = this.search().trim().toLowerCase();
    const selectedCategory = this.categoryId();
    const selectedModality = this.modality();
    const minimum = this.minimumPrice();
    const maximum = this.maximumPrice();

    return this.services().filter((service) => {
      const professional = service.professionalProfile?.professional;
      const searchableText = [
        service.name,
        service.description,
        service.category?.name,
        service.professionalProfile?.professionalTitle,
        professional?.firstName,
        professional?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const price = Number(service.price);

      return (
        this.isBookable(service) &&
        (!text || searchableText.includes(text)) &&
        (selectedCategory === null || service.categoryId === selectedCategory) &&
        (selectedModality === null || service.modality === selectedModality) &&
        (minimum === null || minimum === undefined || price >= Number(minimum)) &&
        (maximum === null || maximum === undefined || price <= Number(maximum))
      );
    });
  });

  totalServices = computed(() => this.filteredServices().length);

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      services: this.transportationService.list(),
      categories: this.categoryService.list(),
    }).subscribe({
      next: ({ services, categories }) => {
        this.services.set(services.data ?? []);
        this.categories.set((categories.data ?? []).filter((category) => category.isAvailable));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The service catalog could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.modality.set(null);
    this.minimumPrice.set(null);
    this.maximumPrice.set(null);
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('en-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  modalityLabel(value: Modality): string {
    return value === 'VIRTUAL' ? 'Virtual coordination' : 'In person';
  }

  professionalName(service: TransportationService): string {
    const user = service.professionalProfile?.professional;
    return user
      ? `${user.firstName} ${user.lastName}`.trim()
      : service.professionalProfile?.professionalTitle ?? 'Professional pending';
  }

  private isBookable(service: TransportationService): boolean {
    const profile = service.professionalProfile;
    const professional = profile?.professional;

    return service.isAvailable
      && service.isActive !== false
      && service.category?.isAvailable !== false
      && service.category?.isActive !== false
      && profile?.isAvailable !== false
      && profile?.isActive !== false
      && professional?.isActive !== false
      && !professional?.isBlocked;
  }
}
