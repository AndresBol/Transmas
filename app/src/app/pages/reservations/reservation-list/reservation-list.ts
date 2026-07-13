import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { Reservation } from '../../../core/models/reservation.model';
import { Status } from '../../../core/models/status.model';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { StatusService } from '../../../core/services/status.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.css',
})
export class ReservationList implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly statusService = inject(StatusService);
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly userService = inject(UserService);
  readonly reservations = signal<Reservation[]>([]);
  readonly statuses = signal<Status[]>([]);
  readonly professionals = signal<ProfessionalProfile[]>([]);
  readonly statusId = signal<number | null>(null);
  readonly professionalId = signal<number | null>(null);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly displayedColumns = [
    'reference',
    'client',
    'service',
    'professional',
    'schedule',
    'status',
    'actions',
  ];

  readonly filteredReservations = computed(() =>
    this.reservations().filter((reservation) => {
      const serviceProfileId =
        reservation.transportationService.professionalProfile?.id ??
        reservation.transportationService.professionalProfileId;
      const date = this.localDateKey(reservation.startDate);
      return (
        (!this.statusId() || reservation.statusId === this.statusId()) &&
        (!this.professionalId() || serviceProfileId === this.professionalId()) &&
        (!this.dateFrom() || date >= this.dateFrom()) &&
        (!this.dateTo() || date <= this.dateTo())
      );
    }),
  );

  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      reservations: this.reservationService.list(),
      statuses: this.statusService.list(),
      professionals: this.professionalService.list(),
    }).subscribe({
      next: ({ reservations, statuses, professionals }) => {
        this.reservations.set(reservations.data);
        this.statuses.set(statuses.data);
        this.professionals.set(professionals.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Reservations and filter options could not be loaded.');
        this.loading.set(false);
      },
    });
  }
  clearFilters(): void {
    this.statusId.set(null);
    this.professionalId.set(null);
    this.dateFrom.set('');
    this.dateTo.set('');
  }
  clientName(reservation: Reservation): string {
    return this.userService.fullName(reservation.client);
  }
  professionalName(profile: ProfessionalProfile): string {
    return profile.professional
      ? this.userService.fullName(profile.professional)
      : profile.professionalTitle;
  }
  reservationProfessional(reservation: Reservation): string {
    const profile = reservation.transportationService.professionalProfile;
    return profile ? this.professionalName(profile) : 'Professional unavailable';
  }
  statusClass(status: string): string {
    return ['Pending', 'Confirmed', 'Completed'].includes(status) ? 'active' : '';
  }

  private localDateKey(value: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
