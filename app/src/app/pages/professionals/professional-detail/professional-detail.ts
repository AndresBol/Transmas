import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Modality, ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { Specialty } from '../../../core/models/specialty.model';
import { TransportationService } from '../../../core/models/transportation-service.model';
import { ImageService } from '../../../core/services/image.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';

@Component({
  selector: 'app-professional-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './professional-detail.html',
  styleUrl: './professional-detail.css',
})
export class ProfessionalDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly serviceApi = inject(TransportationServiceService);
  private readonly imageService = inject(ImageService);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  professional = signal<ProfessionalProfile | null>(null);
  services = signal<TransportationService[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('The professional identifier is invalid.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      profile: this.professionalService.getById(this.id),
      services: this.serviceApi.list(),
    }).subscribe({
      next: ({ profile, services }) => {
        this.professional.set(profile.data);
        this.services.set(
          (services.data ?? []).filter((service) => service.professionalProfileId === this.id),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The professional profile could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  profileName(profile: ProfessionalProfile): string {
    const user = profile.professional;
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'Professional';
  }

  profileImage(profile: ProfessionalProfile): string {
    return this.imageService.getImageUrl(profile.profilePictureUrl);
  }

  useFallback(event: Event): void {
    (event.target as HTMLImageElement).src = this.imageService.getImageUrl('image-not-found.svg');
  }

  specialties(profile: ProfessionalProfile): Specialty[] {
    return profile.specialties?.map((item) => item.specialty).filter(Boolean) ?? [];
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

  isEffectivelyAvailable(profile: ProfessionalProfile): boolean {
    return this.professionalService.isEffectivelyAvailable(profile);
  }
}
