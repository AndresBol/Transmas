import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { Specialty } from '../../../core/models/specialty.model';
import {
  TransportationServiceCreateDto,
  TransportationServiceUpdateDto,
} from '../../../core/models/transportation-service.model';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';
import { ServiceForm } from '../../../shared/components/service-form/service-form';

@Component({
  selector: 'app-service-create-page',
  standalone: true,
  imports: [ServiceForm, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './service-create-page.html',
  styleUrl: './service-create-page.css',
})
export class ServiceCreatePage {
  private readonly router = inject(Router);
  private readonly serviceApi = inject(TransportationServiceService);
  private readonly categoryService = inject(CategoryService);
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notificationService = inject(NotificationService);

  categories = signal<Category[]>([]);
  professionals = signal<ProfessionalProfile[]>([]);
  specialties = signal<Specialty[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadFormData();
  }

  loadFormData(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      categories: this.categoryService.list(),
      professionals: this.professionalService.list(),
      specialties: this.specialtyService.list(),
    }).subscribe({
      next: ({ categories, professionals, specialties }) => {
        this.categories.set(categories.data ?? []);
        this.professionals.set(professionals.data ?? []);
        this.specialties.set(specialties.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The service form data could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  save(data: TransportationServiceCreateDto | TransportationServiceUpdateDto): void {
    this.saving.set(true);
    this.error.set(null);
    this.serviceApi.create(data as TransportationServiceCreateDto).subscribe({
      next: () => {
        this.notificationService.success('The transportation service was created');
        this.router.navigate(['/admin/services']);
      },
      error: () => {
        this.error.set(
          'The transportation service could not be created. Review the form and try again.',
        );
        this.notificationService.error('The transportation service could not be created');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/services']);
  }
}
