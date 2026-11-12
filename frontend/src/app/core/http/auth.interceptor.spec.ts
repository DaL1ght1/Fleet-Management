import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { accessToken: () => Promise.resolve('token-123') } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('adds the access token to account requests', async () => {
    http.get('/auth/me').subscribe();
    await Promise.resolve();

    expect(backend.expectOne('/auth/me').request.headers.get('Authorization')).toBe('Bearer token-123');
  });

  it('leaves sign-in and refresh requests untouched', () => {
    http.post('/auth/sign-in', {}).subscribe();
    http.post('/auth/refresh', {}).subscribe();

    expect(backend.expectOne('/auth/sign-in').request.headers.has('Authorization')).toBeFalse();
    expect(backend.expectOne('/auth/refresh').request.headers.has('Authorization')).toBeFalse();
  });
});
