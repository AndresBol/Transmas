import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfessionalCreatePage } from './professional-create-page';

describe('ProfessionalCreatePage', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [ProfessionalCreatePage], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(ProfessionalCreatePage).componentInstance).toBeTruthy();
  });
});
