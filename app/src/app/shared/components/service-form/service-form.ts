import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, min, minLength, required, validate } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../../core/models/category.model';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { Specialty } from '../../../core/models/specialty.model';
import {
  TransportationService,
  TransportationServiceCreateDto,
  TransportationServiceFormModel,
  TransportationServiceUpdateDto,
} from '../../../core/models/transportation-service.model';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    FormField,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
})
export class ServiceForm {
  service = input<TransportationService | null>(null);
  professionals = input<ProfessionalProfile[]>([]);
  categories = input<Category[]>([]);
  specialties = input<Specialty[]>([]);
  saving = input(false);

  save = output<TransportationServiceCreateDto | TransportationServiceUpdateDto>();
  cancel = output<void>();

  readonly modalities = [
    { value: 'IN_PERSON' as const, label: 'In person' },
    { value: 'VIRTUAL' as const, label: 'Virtual coordination' },
  ];

  serviceModel = signal<TransportationServiceFormModel>(this.emptyModel());
  selectedProfessional = computed(() =>
    this.professionals().find((profile) => profile.id === this.serviceModel().professionalProfileId),
  );

  serviceForm = form(this.serviceModel, (path) => {
    required(path.professionalProfileId, { message: 'Select a professional' });
    required(path.categoryId, { message: 'Select a category' });

    required(path.name, { message: 'Service name is required' });
    minLength(path.name, 3, { message: 'Use at least 3 characters' });
    maxLength(path.name, 150, { message: 'Use no more than 150 characters' });

    required(path.description, { message: 'Description is required' });
    minLength(path.description, 10, { message: 'Use at least 10 characters' });
    maxLength(path.description, 500, { message: 'Use no more than 500 characters' });

    required(path.price, { message: 'Price is required' });
    min(path.price, 0.01, { message: 'Price must be greater than zero' });

    required(path.estimatedDuration, { message: 'Estimated duration is required' });
    min(path.estimatedDuration, 1, { message: 'Duration must be at least one minute' });
    validate(path.estimatedDuration, (context) => {
      if (!Number.isInteger(Number(context.value()))) {
        return { kind: 'wholeMinutes', message: 'Duration must be a whole number of minutes' };
      }
      return undefined;
    });

    required(path.modality, { message: 'Select a modality' });
    validate(path.modality, (context) => {
      const professional = this.selectedProfessional();
      if (professional && context.value() !== professional.modality) {
        return {
          kind: 'modalityMismatch',
          message: 'The service modality must match the selected professional',
        };
      }
      return undefined;
    });
  });

  isEdit = computed(() => this.service() !== null);

  constructor() {
    effect(() => {
      const service = this.service();
      if (!service) {
        this.serviceModel.set(this.emptyModel());
        return;
      }

      this.serviceModel.set({
        professionalProfileId: service.professionalProfileId ?? null,
        categoryId: service.categoryId ?? null,
        name: service.name ?? '',
        description: service.description ?? '',
        price: Number(service.price ?? 0),
        estimatedDuration: Number(service.estimatedDuration ?? 0),
        modality: service.modality ?? 'IN_PERSON',
        isAvailable: service.isAvailable ?? true,
        specialtyIds: service.specialties?.map((item) => item.specialtyId) ?? [],
      });
    });
  }

  onProfessionalChange(professionalId: number | null): void {
    const professional = this.professionals().find((profile) => profile.id === professionalId);
    if (professional) {
      this.serviceModel.update((value) => ({ ...value, modality: professional.modality }));
    }
  }

  professionalName(profile: ProfessionalProfile): string {
    const user = profile.professional;
    const name = user ? `${user.firstName} ${user.lastName}`.trim() : profile.professionalTitle;
    return `${name} - ${profile.professionalTitle}`;
  }

  toggleSpecialty(id: number, checked: boolean): void {
    this.serviceModel.update((value) => ({
      ...value,
      specialtyIds: checked
        ? Array.from(new Set([...value.specialtyIds, id]))
        : value.specialtyIds.filter((specialtyId) => specialtyId !== id),
    }));
  }

  isSpecialtySelected(id: number): boolean {
    return this.serviceModel().specialtyIds.includes(id);
  }

  submit(): void {
    if (this.saving()) {
      return;
    }
    this.markFieldsTouched();
    if (this.formIsInvalid()) {
      return;
    }

    const value = this.serviceModel();
    this.save.emit({
      professionalProfileId: Number(value.professionalProfileId),
      categoryId: Number(value.categoryId),
      name: value.name.trim(),
      description: value.description.trim(),
      price: Number(value.price),
      estimatedDuration: Number(value.estimatedDuration),
      modality: value.modality!,
      isAvailable: value.isAvailable,
      specialtyIds: Array.from(new Set(value.specialtyIds)),
    });
  }

  private emptyModel(): TransportationServiceFormModel {
    return {
      professionalProfileId: null,
      categoryId: null,
      name: '',
      description: '',
      price: 0,
      estimatedDuration: 60,
      modality: 'IN_PERSON',
      isAvailable: true,
      specialtyIds: [],
    };
  }

  private markFieldsTouched(): void {
    this.serviceForm.professionalProfileId().markAsTouched();
    this.serviceForm.categoryId().markAsTouched();
    this.serviceForm.name().markAsTouched();
    this.serviceForm.description().markAsTouched();
    this.serviceForm.price().markAsTouched();
    this.serviceForm.estimatedDuration().markAsTouched();
    this.serviceForm.modality().markAsTouched();
  }

  private formIsInvalid(): boolean {
    return (
      this.serviceForm.professionalProfileId().invalid() ||
      this.serviceForm.categoryId().invalid() ||
      this.serviceForm.name().invalid() ||
      this.serviceForm.description().invalid() ||
      this.serviceForm.price().invalid() ||
      this.serviceForm.estimatedDuration().invalid() ||
      this.serviceForm.modality().invalid()
    );
  }
}
