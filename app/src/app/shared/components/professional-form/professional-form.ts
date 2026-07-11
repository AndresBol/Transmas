import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
  FormField,
  form,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { District } from '../../../core/models/district.model';
import {
  ProfessionalCreateDto,
  ProfessionalFormModel,
  ProfessionalProfile,
  ProfessionalUpdateDto,
} from '../../../core/models/professional-profile.model';
import { Specialty } from '../../../core/models/specialty.model';
import { ImageService } from '../../../core/services/image.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-professional-form',
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
  templateUrl: './professional-form.html',
  styleUrl: './professional-form.css',
})
export class ProfessionalForm {
  private readonly imageService = inject(ImageService);
  private readonly notificationService = inject(NotificationService);

  professional = input<ProfessionalProfile | null>(null);
  districts = input<District[]>([]);
  specialties = input<Specialty[]>([]);
  saving = input(false);

  save = output<ProfessionalCreateDto | ProfessionalUpdateDto>();
  cancel = output<void>();

  readonly modalities = [
    { value: 'IN_PERSON' as const, label: 'In person' },
    { value: 'VIRTUAL' as const, label: 'Virtual coordination' },
  ];

  uploadingImage = signal(false);
  imagePreview = signal<string | null>(null);
  selectedImageFile = signal<File | null>(null);
  imageError = signal<string | null>(null);

  professionalModel = signal<ProfessionalFormModel>(this.emptyModel());

  professionalForm = form(this.professionalModel, (path) => {
    required(path.firstName, { message: 'First name is required' });
    minLength(path.firstName, 2, { message: 'Use at least 2 characters' });
    maxLength(path.firstName, 100, { message: 'Use no more than 100 characters' });

    required(path.lastName, { message: 'Last name is required' });
    minLength(path.lastName, 2, { message: 'Use at least 2 characters' });
    maxLength(path.lastName, 100, { message: 'Use no more than 100 characters' });

    required(path.email, { message: 'Email is required' });
    pattern(path.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Enter a valid email address' });

    required(path.phoneNumber, { message: 'Phone number is required' });
    pattern(path.phoneNumber, /^[+]?[0-9\s()-]{8,30}$/, {
      message: 'Enter a valid phone number',
    });

    validate(path.password, (context) => {
      if (this.professional() === null && context.value().length < 6) {
        return { kind: 'minimumPasswordLength', message: 'Password must have at least 6 characters' };
      }
      return undefined;
    });

    required(path.professionalTitle, { message: 'Professional title is required' });
    minLength(path.professionalTitle, 3, { message: 'Use at least 3 characters' });
    maxLength(path.professionalTitle, 150, { message: 'Use no more than 150 characters' });

    required(path.description, { message: 'Description is required' });
    minLength(path.description, 10, { message: 'Use at least 10 characters' });
    maxLength(path.description, 500, { message: 'Use no more than 500 characters' });

    required(path.experienceYears, { message: 'Experience is required' });
    min(path.experienceYears, 0, { message: 'Experience cannot be negative' });
    validate(path.experienceYears, (context) => {
      if (!Number.isInteger(Number(context.value()))) {
        return { kind: 'wholeYears', message: 'Experience must be a whole number' };
      }
      return undefined;
    });

    required(path.modality, { message: 'Select a modality' });
    required(path.districtId, { message: 'Select a district' });
    required(path.baseRate, { message: 'Base rate is required' });
    min(path.baseRate, 0.01, { message: 'Base rate must be greater than zero' });
  });

  isEdit = computed(() => this.professional() !== null);
  isSubmitting = computed(() => this.saving() || this.uploadingImage());

  constructor() {
    effect(() => {
      const profile = this.professional();
      if (!profile) {
        this.professionalModel.set(this.emptyModel());
        this.selectedImageFile.set(null);
        this.imagePreview.set(null);
        this.imageError.set(null);
        return;
      }

      this.professionalModel.set({
        firstName: profile.professional?.firstName ?? '',
        lastName: profile.professional?.lastName ?? '',
        email: profile.professional?.email ?? '',
        phoneNumber: profile.professional?.phoneNumber ?? '',
        password: '',
        professionalTitle: profile.professionalTitle ?? '',
        description: profile.description ?? '',
        experienceYears: Number(profile.experienceYears ?? 0),
        modality: profile.modality ?? 'IN_PERSON',
        districtId: profile.districtId ?? null,
        baseRate: Number(profile.baseRate ?? 0),
        isAvailable: profile.isAvailable ?? true,
        profilePictureUrl: profile.profilePictureUrl ?? 'image-not-found.svg',
        specialtyIds: profile.specialties?.map((item) => item.specialtyId) ?? [],
      });
      this.selectedImageFile.set(null);
      this.imageError.set(null);
      this.imagePreview.set(this.imageService.getImageUrl(profile.profilePictureUrl));
    });
  }

  onImageSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    this.imageError.set(null);

    if (!file) {
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      this.imageError.set('Choose a JPG, PNG, or WebP image');
      inputElement.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.imageError.set('The image cannot exceed 2 MB');
      inputElement.value = '';
      return;
    }

    this.selectedImageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  toggleSpecialty(id: number, checked: boolean): void {
    this.professionalModel.update((value) => ({
      ...value,
      specialtyIds: checked
        ? Array.from(new Set([...value.specialtyIds, id]))
        : value.specialtyIds.filter((specialtyId) => specialtyId !== id),
    }));
  }

  isSpecialtySelected(id: number): boolean {
    return this.professionalModel().specialtyIds.includes(id);
  }

  districtLabel(district: District): string {
    const canton = district.canton?.name;
    const province = district.canton?.province?.name;
    return [district.name, canton, province].filter(Boolean).join(', ');
  }

  submit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.markFieldsTouched();
    if (this.formIsInvalid() || this.imageError()) {
      return;
    }

    const selectedFile = this.selectedImageFile();
    if (selectedFile) {
      this.uploadAndSave(selectedFile);
      return;
    }

    this.emitSave();
  }

  private emptyModel(): ProfessionalFormModel {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      professionalTitle: '',
      description: '',
      experienceYears: 0,
      modality: 'IN_PERSON',
      districtId: null,
      baseRate: 0,
      isAvailable: true,
      profilePictureUrl: 'image-not-found.svg',
      specialtyIds: [],
    };
  }

  private markFieldsTouched(): void {
    this.professionalForm.firstName().markAsTouched();
    this.professionalForm.lastName().markAsTouched();
    this.professionalForm.email().markAsTouched();
    this.professionalForm.phoneNumber().markAsTouched();
    if (!this.isEdit()) {
      this.professionalForm.password().markAsTouched();
    }
    this.professionalForm.professionalTitle().markAsTouched();
    this.professionalForm.description().markAsTouched();
    this.professionalForm.experienceYears().markAsTouched();
    this.professionalForm.modality().markAsTouched();
    this.professionalForm.districtId().markAsTouched();
    this.professionalForm.baseRate().markAsTouched();
  }

  private formIsInvalid(): boolean {
    return (
      this.professionalForm.firstName().invalid() ||
      this.professionalForm.lastName().invalid() ||
      this.professionalForm.email().invalid() ||
      this.professionalForm.phoneNumber().invalid() ||
      (!this.isEdit() && this.professionalForm.password().invalid()) ||
      this.professionalForm.professionalTitle().invalid() ||
      this.professionalForm.description().invalid() ||
      this.professionalForm.experienceYears().invalid() ||
      this.professionalForm.modality().invalid() ||
      this.professionalForm.districtId().invalid() ||
      this.professionalForm.baseRate().invalid()
    );
  }

  private uploadAndSave(file: File): void {
    this.uploadingImage.set(true);

    this.imageService.upload(file).subscribe({
      next: (response) => {
        this.professionalModel.update((value) => ({
          ...value,
          profilePictureUrl: response.fileName,
        }));
        this.uploadingImage.set(false);
        this.emitSave();
      },
      error: () => {
        this.uploadingImage.set(false);
        this.notificationService.error('The profile image could not be uploaded');
      },
    });
  }

  private emitSave(): void {
    const value = this.professionalModel();
    const sharedData: ProfessionalUpdateDto = {
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim().toLowerCase(),
      phoneNumber: value.phoneNumber.trim(),
      professionalTitle: value.professionalTitle.trim(),
      description: value.description.trim(),
      experienceYears: Number(value.experienceYears),
      modality: value.modality!,
      districtId: Number(value.districtId),
      baseRate: Number(value.baseRate),
      isAvailable: value.isAvailable,
      profilePictureUrl: value.profilePictureUrl || 'image-not-found.svg',
      specialtyIds: Array.from(new Set(value.specialtyIds)),
    };

    if (this.isEdit()) {
      this.save.emit(sharedData);
      return;
    }
    this.save.emit({ ...sharedData, password: value.password });
  }
}
