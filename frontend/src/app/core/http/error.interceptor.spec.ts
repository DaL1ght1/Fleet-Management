import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { Notifier } from '../notifications/notifier.service';
import { errorInterceptor } from './error.interceptor';
import { SILENT_ERRORS } from './silent-errors';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const auth = jasmine.createSpyObj<AuthService>('AuthService', ['sessionExpired']);
  const notifier = jasmine.createSpyObj<Notifier>('Notifier', ['errorKey']);

  beforeEach(() => {
    auth.sessionExpired.calls.reset();
    notifier.errorKey.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Notifier, useValue: notifier },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    jasmine.clock().uninstall();
  });

  it('retries idempotent requests on server errors', () => {
    jasmine.clock().install();
    http.get('/resource').subscribe({ error: () => undefined });

    backend.expectOne('/resource').flush(null, { status: 503, statusText: 'Unavailable' });
    jasmine.clock().tick(1000);
    backend.expectOne('/resource').flush(null, { status: 503, statusText: 'Unavailable' });
    jasmine.clock().tick(2000);
    backend.expectOne('/resource').flush(null, { status: 503, statusText: 'Unavailable' });

    expect(notifier.errorKey).toHaveBeenCalledOnceWith('errors.unavailable');
  });

  it('never retries mutations', () => {
    jasmine.clock().install();
    http.post('/graphql', {}).subscribe({ error: () => undefined });

    backend.expectOne('/graphql').flush(null, { status: 500, statusText: 'Server Error' });

    expect(notifier.errorKey).toHaveBeenCalledOnceWith('errors.unexpected');
  });

  it('sends the user back to sign in when the session expired', () => {
    jasmine.clock().install();
    http.post('/graphql', {}).subscribe({ error: () => undefined });

    backend.expectOne('/graphql').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.sessionExpired).toHaveBeenCalled();
    expect(notifier.errorKey).toHaveBeenCalledOnceWith('errors.sessionExpired');
  });

  it('leaves silent requests to the caller', () => {
    http
      .post('/auth/sign-in', {}, { context: new HttpContext().set(SILENT_ERRORS, true) })
      .subscribe({ error: () => undefined });

    backend.expectOne('/auth/sign-in').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.sessionExpired).not.toHaveBeenCalled();
    expect(notifier.errorKey).not.toHaveBeenCalled();
  });
});
