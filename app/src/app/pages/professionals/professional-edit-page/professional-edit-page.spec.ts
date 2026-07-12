import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProfessionalEditPage } from './professional-edit-page';

describe('ProfessionalEditPage', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [ProfessionalEditPage], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(ProfessionalEditPage).componentInstance).toBeTruthy();
  });
});
