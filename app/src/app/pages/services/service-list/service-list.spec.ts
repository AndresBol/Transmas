import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceList } from './service-list';

describe('ServiceList', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(ServiceList).componentInstance).toBeTruthy();
  });
});
