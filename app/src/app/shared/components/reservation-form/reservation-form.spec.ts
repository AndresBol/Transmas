import { TestBed } from '@angular/core/testing';
import { ProfessionalProfile } from '../../../core/models/professional-profile.model';
import { TransportationService } from '../../../core/models/transportation-service.model';
import { ReservationForm } from './reservation-form';

describe('ReservationForm', () => {
  it('creates the form', async () => {
    await TestBed.configureTestingModule({ imports: [ReservationForm] }).compileComponents();
    expect(TestBed.createComponent(ReservationForm).componentInstance).toBeTruthy();
  });

  it('preselects the requested service and its professional', async () => {
    await TestBed.configureTestingModule({ imports: [ReservationForm] }).compileComponents();
    const fixture = TestBed.createComponent(ReservationForm);
    const professional: ProfessionalProfile = {
      id: 7,
      professionalTitle: 'Driver',
      description: 'Professional driver',
      experienceYears: 5,
      modality: 'IN_PERSON',
      baseRate: 100,
      isAvailable: true,
      profilePictureUrl: 'image-not-found.svg',
      professionalId: 10,
      districtId: 1,
    };
    const service: TransportationService = {
      id: 42,
      name: 'Airport transfer',
      description: 'Private airport transportation',
      price: 25000,
      estimatedDuration: 60,
      modality: 'IN_PERSON',
      isAvailable: true,
      professionalProfileId: professional.id,
      categoryId: 1,
    };

    fixture.componentRef.setInput('professionals', [professional]);
    fixture.componentRef.setInput('services', [service]);
    fixture.componentRef.setInput('initialServiceId', service.id);
    fixture.detectChanges();

    expect(fixture.componentInstance.model().professionalProfileId).toBe(professional.id);
    expect(fixture.componentInstance.model().transportationServiceId).toBe(service.id);
    expect(fixture.componentInstance.model().modality).toBe(service.modality);
  });
});
