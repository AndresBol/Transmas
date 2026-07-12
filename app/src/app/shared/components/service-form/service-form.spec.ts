import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceForm } from './service-form';

describe('ServiceForm', () => {
  let fixture: ComponentFixture<ServiceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ServiceForm] }).compileComponents();
    fixture = TestBed.createComponent(ServiceForm);
    fixture.detectChanges();
  });

  it('creates the form', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
