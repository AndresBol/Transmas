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
import { Modality, ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { ImageService } from '../../../core/services/image.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';

@Component({
  selector: 'app-professional-list',
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
  templateUrl: './professional-list.html',
  styleUrl: './professional-list.css',
})
export class ProfessionalList {
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly imageService = inject(ImageService);

  professionals = signal<ProfessionalProfile[]>([]);
  search = signal('');
  modality = signal<Modality | null>(null);
  availability = signal<boolean | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  filteredProfessionals = computed(() => {
    const text = this.search().trim().toLowerCase();
    const modality = this.modality();
    const availability = this.availability();
    return this.professionals().filter((profile) => {
      const searchable = [
        profile.professional?.firstName,
        profile.professional?.lastName,
        profile.professionalTitle,
        profile.description,
        profile.district?.name,
        profile.district?.canton?.name,
        profile.district?.canton?.province?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return (
        (!text || searchable.includes(text)) &&
        (modality === null || profile.modality === modality) &&
        (availability === null || this.isEffectivelyAvailable(profile) === availability)
      );
    });
  });

  constructor() {
    this.loadProfessionals();
  }

  loadProfessionals(): void {
    this.loading.set(true);
    this.error.set(null);
    this.professionalService.list().subscribe({
      next: (response) => {
        this.professionals.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The professional directory could not be loaded.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.modality.set(null);
    this.availability.set(null);
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
