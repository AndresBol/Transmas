import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ServiceDetail } from './service-detail';

describe('ServiceDetail', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceDetail],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(ServiceDetail).componentInstance).toBeTruthy();
  });
});
