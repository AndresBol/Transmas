import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CategoryList } from './category-list';

describe('CategoryList', () => {
  it('creates the page', async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
    expect(TestBed.createComponent(CategoryList).componentInstance).toBeTruthy();
  });
});
