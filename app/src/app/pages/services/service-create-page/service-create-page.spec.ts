import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceCreatePage } from './service-create-page';

describe('ServiceCreatePage', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [ServiceCreatePage], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(ServiceCreatePage).componentInstance).toBeTruthy();
  });
});
