import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { District } from '../../../core/models/district.model';
import { Reservation } from '../../../core/models/reservation.model';
import { userFullName } from '../../../core/models/user.model';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({ selector: 'app-reservation-detail', standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './reservation-detail.html', styleUrl: './reservation-detail.css' })
export class ReservationDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ReservationService);
  readonly reservation = signal<Reservation | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) { this.error.set('The reservation reference is invalid.'); return; }
    this.load(id);
  }
  load(id: number): void { this.loading.set(true); this.error.set(null); this.service.getById(id).subscribe({
    next: ({ data }) => { this.reservation.set(data); this.loading.set(false); },
    error: () => { this.error.set('The reservation details could not be loaded.'); this.loading.set(false); },
  }); }
  fullName(reservation: Reservation): string { return userFullName(reservation.client); }
  professionalName(reservation: Reservation): string {
    const profile = reservation.transportationService.professionalProfile;
    return profile?.professional ? userFullName(profile.professional) : profile?.professionalTitle ?? 'Professional unavailable';
  }
  districtLabel(district: District): string { return [district.name, district.canton?.name, district.canton?.province?.name].filter(Boolean).join(', '); }
  formatCurrency(value: number | string): string { return new Intl.NumberFormat('en-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 }).format(Number(value)); }
}
