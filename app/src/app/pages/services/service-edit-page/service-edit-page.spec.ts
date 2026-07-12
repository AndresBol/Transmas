import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceEditPage } from './service-edit-page';

describe('ServiceEditPage', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [ServiceEditPage], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(ServiceEditPage).componentInstance).toBeTruthy();
  });
});
