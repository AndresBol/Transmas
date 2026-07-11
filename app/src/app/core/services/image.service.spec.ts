import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ImageService } from './image.service';

describe('ImageService', () => {
  let service: ImageService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ImageService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('uploads only the selected image', () => {
    const file = new File(['image'], 'profile.png', { type: 'image/png' });

    service.upload(file).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/images/upload`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get('image')).toBe(file);
    expect(request.request.body.has('previousFileName')).toBe(false);
    request.flush({ message: 'Image uploaded successfully', fileName: 'profile-unique.png' });
  });
});
