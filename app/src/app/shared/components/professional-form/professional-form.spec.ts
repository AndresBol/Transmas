import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ProfessionalForm } from './professional-form';

describe('ProfessionalForm', () => {
  let fixture: ComponentFixture<ProfessionalForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfessionalForm);
    fixture.detectChanges();
  });

  it('creates the form', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
