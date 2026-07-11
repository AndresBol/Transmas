import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialog } from './confirmation-dialog';

describe('ConfirmationDialog', () => {
  it('creates the dialog', async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Confirm', message: 'Continue?' } },
        { provide: MatDialogRef, useValue: { close: () => undefined } },
      ],
    }).compileComponents();

    expect(TestBed.createComponent(ConfirmationDialog).componentInstance).toBeTruthy();
  });
});
