import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceAdminList } from './service-admin-list';

describe('ServiceAdminList', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceAdminList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(ServiceAdminList).componentInstance).toBeTruthy();
  });
});
