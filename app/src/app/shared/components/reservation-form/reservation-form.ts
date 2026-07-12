import { Component, computed, input, OnInit, output, signal } from '@angular/core';
import { FormField, form, maxLength, min, minLength, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { District } from '../../../core/models/district.model';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { ReservationCreateDto, ReservationFormModel } from '../../../core/models/reservation.model';
import { Modality, TransportationService } from '../../../core/models/transportation-service.model';
import { User, userFullName } from '../../../core/models/user.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [FormField, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css',
})
export class ReservationForm implements OnInit {
  clients = input<User[]>([]);
  professionals = input<ProfessionalProfile[]>([]);
  services = input<TransportationService[]>([]);
  districts = input<District[]>([]);
  initialServiceId = input<number | null>(null);
  saving = input(false);
  save = output<ReservationCreateDto>();
  cancel = output<void>();

  readonly scheduleError = signal<string | null>(null);
  readonly relationshipError = signal<string | null>(null);
  readonly model = signal<ReservationFormModel>({
    clientId: null,
    professionalProfileId: null,
    transportationServiceId: null,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    modality: 'IN_PERSON',
    description: '',
    passengerCount: 1,
    pickupAddress: '',
    pickupDistrictId: null,
    pickupLatitude: null,
    pickupLongitude: null,
    dropoffAddress: '',
    dropoffDistrictId: null,
    dropoffLatitude: null,
    dropoffLongitude: null,
  });

  readonly reservationForm = form(this.model, (path) => {
    required(path.clientId, { message: 'Select a client.' });
    required(path.professionalProfileId, { message: 'Select a professional.' });
    required(path.transportationServiceId, { message: 'Select a service.' });
    required(path.startDate, { message: 'Select a start date.' });
    required(path.startTime, { message: 'Select a start time.' });
    required(path.endDate, { message: 'Select an end date.' });
    required(path.endTime, { message: 'Select an end time.' });
    required(path.modality, { message: 'Select a modality.' });
    required(path.description, { message: 'Describe the transportation request.' });
    minLength(path.description, 10, { message: 'Enter at least 10 characters.' });
    maxLength(path.description, 500, { message: 'Enter no more than 500 characters.' });
    required(path.passengerCount, { message: 'Enter the passenger count.' });
    min(path.passengerCount, 1, { message: 'At least one passenger is required.' });
    validate(path.passengerCount, ({ value }) => Number.isInteger(Number(value())) ? undefined
      : { kind: 'integer', message: 'Passenger count must be a whole number.' });
    required(path.pickupAddress, { message: 'Enter the pickup address.' });
    maxLength(path.pickupAddress, 255, { message: 'Enter no more than 255 characters.' });
    required(path.pickupDistrictId, { message: 'Select the pickup district.' });
    required(path.pickupLatitude, { message: 'Enter the pickup latitude.' });
    required(path.pickupLongitude, { message: 'Enter the pickup longitude.' });
    required(path.dropoffAddress, { message: 'Enter the drop-off address.' });
    maxLength(path.dropoffAddress, 255, { message: 'Enter no more than 255 characters.' });
    required(path.dropoffDistrictId, { message: 'Select the drop-off district.' });
    required(path.dropoffLatitude, { message: 'Enter the drop-off latitude.' });
    required(path.dropoffLongitude, { message: 'Enter the drop-off longitude.' });
    validate(path.pickupLatitude, ({ value }) => this.coordinateError(value(), -90, 90, 'Latitude'));
    validate(path.dropoffLatitude, ({ value }) => this.coordinateError(value(), -90, 90, 'Latitude'));
    validate(path.pickupLongitude, ({ value }) => this.coordinateError(value(), -180, 180, 'Longitude'));
    validate(path.dropoffLongitude, ({ value }) => this.coordinateError(value(), -180, 180, 'Longitude'));
  });

  readonly filteredServices = computed(() => {
    const professionalId = this.model().professionalProfileId;
    if (!professionalId) return [];
    return this.services().filter((service) => service.professionalProfileId === professionalId
      && service.isAvailable && service.isActive !== false);
  });

  readonly minimumDate = this.localDateInputValue(new Date());

  ngOnInit(): void {
    const initialServiceId = this.initialServiceId();
    if (initialServiceId === null) return;

    const service = this.services().find((item) => item.id === initialServiceId);
    const professional = this.professionals().find(
      (item) => item.id === service?.professionalProfileId,
    );
    if (!service || !professional || professional.modality !== service.modality) return;

    this.model.update((value) => ({
      ...value,
      professionalProfileId: professional.id,
      transportationServiceId: service.id,
      modality: service.modality,
    }));
  }

  professionalChanged(id: number | null): void {
    const professional = this.professionals().find((item) => item.id === id);
    this.model.update((value) => ({ ...value, professionalProfileId: id, transportationServiceId: null,
      modality: professional?.modality ?? value.modality }));
    this.relationshipError.set(null);
  }

  serviceChanged(id: number | null): void {
    const service = this.services().find((item) => item.id === id);
    this.model.update((value) => ({ ...value, transportationServiceId: id, modality: service?.modality ?? value.modality }));
    this.relationshipError.set(null);
  }

  clientName(client: User): string { return userFullName(client); }
  professionalName(profile: ProfessionalProfile): string {
    return profile.professional ? userFullName(profile.professional) : profile.professionalTitle;
  }
  districtLabel(district: District): string {
    const canton = district.canton?.name;
    const province = district.canton?.province?.name;
    return [district.name, canton, province].filter(Boolean).join(', ');
  }
  modalityLabel(modality: Modality): string { return modality === 'IN_PERSON' ? 'In person' : 'Virtual coordination'; }

  submit(): void {
    if (this.saving()) return;
    this.touchRequiredFields();
    this.scheduleError.set(null);
    this.relationshipError.set(null);
    if (this.hasInvalidFields()) return;

    const value = this.model();
    const professional = this.professionals().find((item) => item.id === value.professionalProfileId);
    const service = this.services().find((item) => item.id === value.transportationServiceId);
    if (!professional || !service || service.professionalProfileId !== professional.id) {
      this.relationshipError.set('The selected service must belong to the selected professional.');
      return;
    }
    if (professional.modality !== value.modality || service.modality !== value.modality) {
      this.relationshipError.set('The reservation modality must match both the professional and service.');
      return;
    }

    const start = this.toDate(value.startDate, value.startTime);
    const end = this.toDate(value.endDate, value.endTime);
    if (!start || !end) { this.scheduleError.set('Enter a valid start and end schedule.'); return; }
    if (start.getTime() <= Date.now()) { this.scheduleError.set('The start date and time must be in the future.'); return; }
    if (end.getTime() <= start.getTime()) { this.scheduleError.set('The end date and time must be after the start.'); return; }

    this.save.emit({
      clientId: Number(value.clientId),
      professionalProfileId: Number(value.professionalProfileId),
      transportationServiceId: Number(value.transportationServiceId),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      modality: value.modality,
      description: value.description.trim(),
      passengerCount: Number(value.passengerCount),
      pickupAddress: value.pickupAddress.trim(),
      pickupDistrictId: Number(value.pickupDistrictId),
      pickupLatitude: Number(value.pickupLatitude),
      pickupLongitude: Number(value.pickupLongitude),
      dropoffAddress: value.dropoffAddress.trim(),
      dropoffDistrictId: Number(value.dropoffDistrictId),
      dropoffLatitude: Number(value.dropoffLatitude),
      dropoffLongitude: Number(value.dropoffLongitude),
    });
  }

  private coordinateError(value: number | null, minimum: number, maximum: number, label: string) {
    if (value === null || value === undefined || value === ('' as unknown as number)) return undefined;
    const number = Number(value);
    return Number.isFinite(number) && number >= minimum && number <= maximum ? undefined
      : { kind: 'coordinate', message: `${label} must be between ${minimum} and ${maximum}.` };
  }

  private toDate(date: string, time: string): Date | null {
    const result = new Date(`${date}T${time}:00`);
    return Number.isNaN(result.getTime()) ? null : result;
  }

  private localDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private touchRequiredFields(): void {
    const fields = this.reservationForm;
    fields.clientId().markAsTouched(); fields.professionalProfileId().markAsTouched();
    fields.transportationServiceId().markAsTouched(); fields.startDate().markAsTouched();
    fields.startTime().markAsTouched(); fields.endDate().markAsTouched(); fields.endTime().markAsTouched();
    fields.modality().markAsTouched(); fields.description().markAsTouched(); fields.passengerCount().markAsTouched();
    fields.pickupAddress().markAsTouched(); fields.pickupDistrictId().markAsTouched();
    fields.pickupLatitude().markAsTouched(); fields.pickupLongitude().markAsTouched();
    fields.dropoffAddress().markAsTouched(); fields.dropoffDistrictId().markAsTouched();
    fields.dropoffLatitude().markAsTouched(); fields.dropoffLongitude().markAsTouched();
  }

  private hasInvalidFields(): boolean {
    const fields = this.reservationForm;
    return fields.clientId().invalid() || fields.professionalProfileId().invalid()
      || fields.transportationServiceId().invalid() || fields.startDate().invalid() || fields.startTime().invalid()
      || fields.endDate().invalid() || fields.endTime().invalid() || fields.modality().invalid()
      || fields.description().invalid() || fields.passengerCount().invalid() || fields.pickupAddress().invalid()
      || fields.pickupDistrictId().invalid() || fields.pickupLatitude().invalid() || fields.pickupLongitude().invalid()
      || fields.dropoffAddress().invalid() || fields.dropoffDistrictId().invalid()
      || fields.dropoffLatitude().invalid() || fields.dropoffLongitude().invalid();
  }
}
