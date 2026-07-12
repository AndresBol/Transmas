import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { User } from '../../../core/models/user.model';
import { ImageService } from '../../../core/services/image.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { ProfessionalList } from './professional-list';

describe('ProfessionalList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalList],
      providers: [
        provideRouter([]),
        { provide: ProfessionalProfileService, useValue: { list: () => of({ success: true, data: [] }) } },
        { provide: ImageService, useValue: { getImageUrl: (name: string) => name } },
      ],
    }).compileComponents();
  });

  it('creates the page', () => {
    expect(TestBed.createComponent(ProfessionalList).componentInstance).toBeTruthy();
  });

  it('filters by effective availability, including the professional account state', () => {
    const component = TestBed.createComponent(ProfessionalList).componentInstance;
    const available = createProfile(1);
    const blocked = createProfile(2, {}, { isBlocked: true });
    const deletedAccount = createProfile(3, {}, { isActive: false });
    const unavailable = createProfile(4, { isAvailable: false });
    component.professionals.set([available, blocked, deletedAccount, unavailable]);

    component.availability.set(true);
    expect(component.filteredProfessionals().map(({ id }) => id)).toEqual([available.id]);

    component.availability.set(false);
    expect(component.filteredProfessionals().map(({ id }) => id)).toEqual([
      blocked.id,
      deletedAccount.id,
      unavailable.id,
    ]);
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
