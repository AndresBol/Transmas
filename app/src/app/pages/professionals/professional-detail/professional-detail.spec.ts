import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfessionalDetail } from './professional-detail';

describe('ProfessionalDetail', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalDetail],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(ProfessionalDetail).componentInstance).toBeTruthy();
  });
});
