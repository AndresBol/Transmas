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
import {
  hasUsableProfessionalAccount,
  isProfessionalEffectivelyAvailable,
  Modality,
  ProfessionalProfile,
} from '../../../core/models/professional-profile.model';
import { ImageService } from '../../../core/services/image.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { ConfirmationDialog, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog';

@Component({
  selector: 'app-professional-admin-list',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatTableModule],
  templateUrl: './professional-admin-list.html',
  styleUrl: './professional-admin-list.css',
})
export class ProfessionalAdminList {
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly imageService = inject(ImageService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  professionals = signal<ProfessionalProfile[]>([]);
  search = signal('');
  modality = signal<Modality | null>(null);
  availability = signal<boolean | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  updatingId = signal<number | null>(null);
  displayedColumns = ['image', 'professional', 'contact', 'location', 'modality', 'rate', 'status', 'actions'];

  filteredProfessionals = computed(() => {
    const text = this.search().trim().toLowerCase();
    const modality = this.modality();
    const availability = this.availability();
    return this.professionals().filter((profile) => {
      const searchable = [profile.professional?.firstName, profile.professional?.lastName, profile.professional?.email, profile.professionalTitle, profile.district?.name].filter(Boolean).join(' ').toLowerCase();
      return (!text || searchable.includes(text))
        && (modality === null || profile.modality === modality)
        && (availability === null || this.isEffectivelyAvailable(profile) === availability);
    });
  });

  constructor() { this.loadProfessionals(); }

  loadProfessionals(): void {
    this.loading.set(true); this.error.set(null);
    this.professionalService.list().subscribe({
      next: (response) => { this.professionals.set(response.data ?? []); this.loading.set(false); },
      error: () => { this.error.set('Professional administration could not be loaded.'); this.loading.set(false); },
    });
  }

  clearFilters(): void { this.search.set(''); this.modality.set(null); this.availability.set(null); }

  confirmAvailability(profile: ProfessionalProfile): void {
    if (!this.canChangeAvailability(profile)) return;

    const isAvailable = !profile.isAvailable;
    const name = this.profileName(profile);
    const data: ConfirmationDialogData = {
      title: isAvailable ? 'Reactivate professional' : 'Make professional unavailable',
      message: isAvailable ? `Make ${name} available for requests again?` : `Mark ${name} as unavailable? The profile can be reactivated later.`,
      confirmLabel: isAvailable ? 'Reactivate' : 'Make unavailable',
      cancelLabel: 'Cancel',
    };
    this.dialog.open(ConfirmationDialog, { data }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.updateAvailability(profile, isAvailable);
    });
  }

  private updateAvailability(profile: ProfessionalProfile, isAvailable: boolean): void {
    this.updatingId.set(profile.id);
    this.professionalService.updateAvailability(profile.id, isAvailable).subscribe({
      next: (response) => {
        this.professionals.update((items) => items.map((item) => item.id === profile.id ? { ...item, ...response.data } : item));
        this.updatingId.set(null);
        this.notificationService.success(isAvailable ? 'The professional is available again' : 'The professional is now unavailable');
      },
      error: () => { this.updatingId.set(null); this.notificationService.error('The professional availability could not be updated'); },
    });
  }

  profileName(profile: ProfessionalProfile): string {
    const user = profile.professional;
    return user ? `${user.firstName} ${user.lastName}`.trim() : 'Professional';
  }
  profileImage(profile: ProfessionalProfile): string { return this.imageService.getImageUrl(profile.profilePictureUrl); }
  useFallback(event: Event): void { (event.target as HTMLImageElement).src = this.imageService.getImageUrl('image-not-found.svg'); }
  formatCurrency(value: number | string): string { return new Intl.NumberFormat('en-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(Number(value)); }
  modalityLabel(value: Modality): string { return value === 'VIRTUAL' ? 'Virtual' : 'In person'; }
  isEffectivelyAvailable(profile: ProfessionalProfile): boolean { return isProfessionalEffectivelyAvailable(profile); }
  canChangeAvailability(profile: ProfessionalProfile): boolean { return hasUsableProfessionalAccount(profile); }
  availabilityLabel(profile: ProfessionalProfile): string {
    if (this.isEffectivelyAvailable(profile)) return 'Available';
    if (profile.isActive === false) return 'Deleted profile';
    if (profile.professional?.isActive === false) return 'Deleted account';
    if (profile.professional?.isBlocked) return 'Blocked account';
    return 'Unavailable';
  }
  availabilityActionLabel(profile: ProfessionalProfile): string {
    if (profile.isActive === false) return 'Deleted profiles cannot change marketplace availability';
    if (profile.professional?.isActive === false) return 'Deleted accounts cannot change marketplace availability';
    if (profile.professional?.isBlocked) return 'Unblock the user account before changing marketplace availability';
    return profile.isAvailable ? 'Make professional unavailable' : 'Reactivate professional';
  }
}
