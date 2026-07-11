import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Specialty } from '../../../core/models/specialty.model';
import { Modality, TransportationService } from '../../../core/models/transportation-service.model';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.css',
})
export class ServiceDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly transportationService = inject(TransportationServiceService);

  service = signal<TransportationService | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  constructor() {
    this.loadService();
  }

  loadService(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.error.set('The service identifier is invalid.');
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.transportationService.getById(this.id).subscribe({
      next: (response) => {
        this.service.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The transportation service could not be loaded.');
        this.loading.set(false);
      },
    });
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
    return user ? `${user.firstName} ${user.lastName}`.trim() : service.professionalProfile?.professionalTitle ?? 'Professional';
  }

  specialties(service: TransportationService): Specialty[] {
    return service.specialties?.map((item) => item.specialty).filter(Boolean) ?? [];
  }

  isBookable(service: TransportationService): boolean {
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
