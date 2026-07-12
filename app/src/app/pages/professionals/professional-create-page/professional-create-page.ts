import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { District } from '../../../core/models/district.model';
import { ProfessionalCreateDto, ProfessionalUpdateDto } from '../../../core/models/professional-profile.model';
import { Specialty } from '../../../core/models/specialty.model';
import { DistrictService } from '../../../core/services/district.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { ProfessionalForm } from '../../../shared/components/professional-form/professional-form';

@Component({
  selector: 'app-professional-create-page',
  standalone: true,
  imports: [ProfessionalForm, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './professional-create-page.html',
  styleUrl: './professional-create-page.css',
})
export class ProfessionalCreatePage {
  private readonly router = inject(Router);
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly districtService = inject(DistrictService);
  private readonly specialtyService = inject(SpecialtyService);
  private readonly notificationService = inject(NotificationService);

  districts = signal<District[]>([]);
  specialties = signal<Specialty[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() { this.loadFormData(); }

  loadFormData(): void {
    this.loading.set(true); this.error.set(null);
    forkJoin({ districts: this.districtService.list(), specialties: this.specialtyService.list() }).subscribe({
      next: ({ districts, specialties }) => {
        this.districts.set(districts.data ?? []);
        this.specialties.set(specialties.data ?? []);
        this.loading.set(false);
      },
      error: () => { this.error.set('The professional form data could not be loaded.'); this.loading.set(false); },
    });
  }

  save(data: ProfessionalCreateDto | ProfessionalUpdateDto): void {
    this.saving.set(true); this.error.set(null);
    this.professionalService.create(data as ProfessionalCreateDto).subscribe({
      next: () => { this.notificationService.success('The professional was created'); this.router.navigate(['/admin/professionals']); },
      error: () => {
        this.error.set('The professional could not be created. Review unique email and phone values, then try again.');
        this.notificationService.error('The professional could not be created');
        this.saving.set(false);
      },
    });
  }

  cancel(): void { this.router.navigate(['/admin/professionals']); }
}
