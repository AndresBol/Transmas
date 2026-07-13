import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ImageService } from '../../../core/services/image.service';
import { ProfessionalProfileService } from '../../../core/services/professional-profile.service';
import { ProfessionalList } from './professional-list';

describe('ProfessionalList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalList],
      providers: [
        provideRouter([]),
        {
          provide: ProfessionalProfileService,
          useValue: {
            list: () => of({ success: true, data: [] }),
          },
        },
        { provide: ImageService, useValue: { getImageUrl: (name: string) => name } },
      ],
    }).compileComponents();
  });

  it('creates the page', () => {
    expect(TestBed.createComponent(ProfessionalList).componentInstance).toBeTruthy();
  });
});
