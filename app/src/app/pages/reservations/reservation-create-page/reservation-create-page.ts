import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { District } from '../../../core/models/district.model';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { ReservationCreateDto } from '../../../core/models/reservation.model';
import { TransportationService } from '../../../core/models/transportation-service.model';
import { User } from '../../../core/models/user.model';
import { DistrictService } from '../../../core/services/district.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { TransportationServiceService } from '../../../core/services/transportation-service.service';
import { UserService } from '../../../core/services/user.service';
import { ReservationForm } from '../../../shared/components/reservation-form/reservation-form';

@Component({ selector: 'app-reservation-create-page', standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ReservationForm],
  templateUrl: './reservation-create-page.html', styleUrl: './reservation-create-page.css' })
export class ReservationCreatePage implements OnInit {
  private readonly userService = inject(UserService);
  private readonly professionalService = inject(ProfessionalProfileService);
  private readonly transportationService = inject(TransportationServiceService);
  private readonly districtService = inject(DistrictService);
  private readonly reservationService = inject(ReservationService);
  private readonly notifications = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly initialServiceId = this.parseServiceId(this.route.snapshot.queryParamMap.get('serviceId'));
  readonly clients = signal<User[]>([]);
  readonly professionals = signal<ProfessionalProfile[]>([]);
  readonly services = signal<TransportationService[]>([]);
  readonly districts = signal<District[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void { this.loadLookups(); }
  loadLookups(): void {
    this.loading.set(true); this.error.set(null);
    forkJoin({ users: this.userService.list(), professionals: this.professionalService.list(),
      services: this.transportationService.list(), districts: this.districtService.list() }).subscribe({
      next: ({ users, professionals, services, districts }) => {
        this.clients.set(users.data.filter((user) => user.role === 'CLIENT' && user.isActive && !user.isBlocked));
        this.professionals.set(professionals.data.filter((profile) => profile.isAvailable
          && profile.isActive !== false && profile.professional?.isActive !== false
          && !profile.professional?.isBlocked));
        this.services.set(services.data.filter((service) => service.isAvailable && service.isActive !== false
          && service.category?.isAvailable !== false && service.category?.isActive !== false));
        this.districts.set(districts.data); this.loading.set(false);
      },
      error: () => { this.error.set('The reservation form options could not be loaded.'); this.loading.set(false); },
    });
  }
  create(dto: ReservationCreateDto): void {
    this.saving.set(true);
    this.reservationService.create(dto).subscribe({
      next: ({ data }) => { this.saving.set(false); this.notifications.success('Reservation created with Pending status.'); this.router.navigate(['/reservations', data.id]); },
      error: () => this.saving.set(false),
    });
  }
  cancel(): void { this.router.navigate(['/reservations']); }

  private parseServiceId(value: string | null): number | null {
    if (value === null) return null;
    const serviceId = Number(value);
    return Number.isInteger(serviceId) && serviceId > 0 ? serviceId : null;
  }
}
