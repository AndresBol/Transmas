import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SpecialtyList } from './specialty-list';

describe('SpecialtyList', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [SpecialtyList], providers: [provideHttpClient(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(SpecialtyList).componentInstance).toBeTruthy();
  });
});
