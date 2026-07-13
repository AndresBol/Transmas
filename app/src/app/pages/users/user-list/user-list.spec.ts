import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { UserList } from './user-list';

describe('UserList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        {
          provide: UserService,
          useValue: {
            list: () => of({ success: true, data: [] }),
          },
        },
      ],
    }).compileComponents();
  });

  it('creates the page', () => {
    expect(TestBed.createComponent(UserList).componentInstance).toBeTruthy();
  });
});
