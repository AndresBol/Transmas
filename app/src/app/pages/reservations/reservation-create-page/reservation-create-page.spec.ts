import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { ReservationCreatePage } from './reservation-create-page';

describe('ReservationCreatePage', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({ imports: [ReservationCreatePage], providers: [provideHttpClient(), provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(ReservationCreatePage).componentInstance).toBeTruthy();
  });

  it('reads the requested service from the query string', async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCreatePage],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ serviceId: '42' }) } },
        },
      ],
    }).compileComponents();

    const page = TestBed.createComponent(ReservationCreatePage).componentInstance;
    expect(page.initialServiceId).toBe(42);
  });
});
