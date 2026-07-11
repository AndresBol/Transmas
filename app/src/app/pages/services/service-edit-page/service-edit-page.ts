import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Category } from '../../../core/models/category.model';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { Specialty } from '../../../core/models/specialty.model';
import { TransportationService, TransportationServiceCreateDto, TransportationServiceUpdateDto } from '../../../core/models/transportation-service.model';
import { CategoryService } from '../../../core/services/category.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';
import { ServiceForm } from '../../../shared/components/service-form/service-form';

@Component({
  selector: 'app-service-edit-page',
  standalone: true,
  imports: [ServiceForm, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './service-edit-page.html',
  styleUrl: './service-edit-page.css',
})
export class ServiceEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly serviceApi = inject(TransportationServiceService);
  private readonly categoryService = inject(CategoryService);
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notificationService = inject(NotificationService);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  service = signal<TransportationService | null>(null);
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
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('The service identifier is invalid.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      service: this.serviceApi.getById(this.id),
      categories: this.categoryService.list(),
      professionals: this.professionalService.list(),
      specialties: this.specialtyService.list(),
    }).subscribe({
      next: ({ service, categories, professionals, specialties }) => {
        this.service.set(service.data);
        this.categories.set(categories.data ?? []);
        this.professionals.set(professionals.data ?? []);
        this.specialties.set(specialties.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The transportation service information could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  save(data: TransportationServiceCreateDto | TransportationServiceUpdateDto): void {
    this.saving.set(true);
    this.error.set(null);
    this.serviceApi.update(this.id, data as TransportationServiceUpdateDto).subscribe({
      next: () => {
        this.notificationService.success('The transportation service was updated');
        this.router.navigate(['/admin/services']);
      },
      error: () => {
        this.error.set('The transportation service could not be updated. Review the form and try again.');
        this.notificationService.error('The transportation service could not be updated');
        this.saving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/services']);
  }
}
