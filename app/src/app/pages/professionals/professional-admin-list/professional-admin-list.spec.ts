import { MatDialog } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { User } from '../../../core/models/user.model';
import { ImageService } from '../../../core/services/image.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { ProfessionalAdminList } from './professional-admin-list';

describe('ProfessionalAdminList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalAdminList],
      providers: [
        provideRouter([]),
        { provide: ProfessionalProfileService, useValue: { list: () => of({ success: true, data: [] }) } },
        { provide: ImageService, useValue: { getImageUrl: (name: string) => name } },
        { provide: NotificationService, useValue: { success: () => undefined, error: () => undefined } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
      ],
    }).compileComponents();
  });

  it('creates the page', () => {
    expect(TestBed.createComponent(ProfessionalAdminList).componentInstance).toBeTruthy();
  });

  it('labels and filters blocked professionals as unavailable', () => {
    const component = TestBed.createComponent(ProfessionalAdminList).componentInstance;
    const available = createProfile(1);
    const blocked = createProfile(2, {}, { isBlocked: true });
    component.professionals.set([available, blocked]);

    component.availability.set(true);
    expect(component.filteredProfessionals().map(({ id }) => id)).toEqual([available.id]);
    expect(component.availabilityLabel(available)).toBe('Available');

    component.availability.set(false);
    expect(component.filteredProfessionals().map(({ id }) => id)).toEqual([blocked.id]);
    expect(component.availabilityLabel(blocked)).toBe('Blocked account');
    expect(component.canChangeAvailability(blocked)).toBe(false);
    expect(component.availabilityActionLabel(blocked)).toContain('Unblock');
  });
});

function createProfile(
  id: number,
  profileChanges: Partial<ProfessionalProfile> = {},
  userChanges: Partial<User> = {},
): ProfessionalProfile {
  return {
    id,
    professionalTitle: 'Driver',
    description: 'Safe transportation',
    experienceYears: 5,
    modality: 'IN_PERSON',
    baseRate: 25000,
    isAvailable: true,
    isActive: true,
    profilePictureUrl: 'profile.jpg',
    professionalId: id,
    districtId: 1,
    ...profileChanges,
    professional: {
      id,
      firstName: `Professional ${id}`,
      lastName: 'Test',
      email: `professional${id}@example.com`,
      phoneNumber: '8888-0000',
      role: 'PROFESSIONAL',
      isBlocked: false,
      isActive: true,
      ...userChanges,
    },
  };
}
