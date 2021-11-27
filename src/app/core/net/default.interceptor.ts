import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponseBase
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, mergeMap, switchMap, take } from 'rxjs/operators';

const CODEMESSAGE: { [key: number]: string } = {
  200: 'The request succeeded.',
  201: 'A new resource was created as a result.',
  202: 'The request has been received but not yet acted upon.',
  204: 'Deleted succesfully.',
  400: 'The server could not understand the request due to invalid syntax.',
  401: 'Unauthenticated Request.',
  403: 'Forbidden.',
  404: 'The server can not find the requested resource.',
  406: 'Contents not acceptables.',
  410: 'Sorry the resource is gone permanently.',
  422: 'The request was well-formed but was unable to be followed due to semantic errors.',
  500: 'The server has encountered a situation it does not know how to handle.',
  502: 'Bad Gateway.',
  503: 'The server is not ready to handle the request.',
  504: 'Gateway Timeout.'
};

/**
 * Default HTTP interceptor. For more details see `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {
  private refreshTokenEnabled = environment.api.refreshTokenEnabled;
  private refreshTokenType: 're-request' | 'auth-refresh' = environment.api.refreshTokenType;
  private refreshToking = false;
  private refreshToken$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private injector: Injector) {
    if (this.refreshTokenType === 'auth-refresh') {
      this.buildAuthRefresh();
    }
  }

  private get notification(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  private get http(): _HttpClient {
    return this.injector.get(_HttpClient);
  }

  private goTo(url: string): void {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private checkStatus(ev: HttpResponseBase): void {
    if ((ev.status >= 200 && ev.status < 300) || ev.status === 401) {
      return;
    }

    const errortext = CODEMESSAGE[ev.status] || ev.statusText;
    this.notification.error(`Bad Request ${ev.status}: ${ev.url}`, errortext);
  }

  /**
   * Refresh Token Request
   */
  private refreshTokenRequest(): Observable<any> {
    const model = this.tokenSrv.get();
    return this.http.post(`/api/auth/refresh`, null, null, { headers: { refresh_token: model?.refresh_token || '' } });
  }

  // #region Method 1: Use 401 to refresh the toekn

  private tryRefreshToken(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // 1、If the request is a fresh token request, then we know the new token can direct us to the login page
    if ([`/api/auth/refresh`].some(url => req.url.includes(url))) {
      this.toLogin();
      return throwError(ev);
    }
    // 2、else if we are already refreshing a token, then all other requests should be swapped to wait queue
    if (this.refreshToking) {
      return this.refreshToken$.pipe(
        filter(v => !!v),
        take(1),
        switchMap(() => next.handle(this.reAttachToken(req)))
      );
    }
    // 3、try the refreshed token
    this.refreshToking = true;
    this.refreshToken$.next(null);

    return this.refreshTokenRequest().pipe(
      switchMap(res => {
        // signal the wait queue to continue process
        this.refreshToking = false;
        this.refreshToken$.next(res);
        // we store the new token and make request again
        this.tokenSrv.set(res);
        return next.handle(this.reAttachToken(req));
      }),
      catchError(err => {
        this.refreshToking = false;
        this.toLogin();
        return throwError(err);
      })
    );
  }

  /**
   * Reload the new token
   * WARNING
   * The reloading routine depends on our current needs, I am using the very default method
   */
  private reAttachToken(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.tokenSrv.get()?.token;
    return req.clone({
      setHeaders: {
        token: `Bearer ${token}`
      }
    });
  }

  // #endregion

  // #region We can also use the refresh API to reload token

  private buildAuthRefresh(): void {
    if (!this.refreshTokenEnabled) {
      return;
    }
    this.tokenSrv.refresh
      .pipe(
        filter(() => !this.refreshToking),
        switchMap(res => {
          console.log(res);
          this.refreshToking = true;
          return this.refreshTokenRequest();
        })
      )
      .subscribe(
        res => {
          // TODO: Mock expired value
          res.expired = +new Date() + 1000 * 60 * 5;
          this.refreshToking = false;
          this.tokenSrv.set(res);
        },
        () => this.toLogin()
      );
  }

  // #endregion

  private toLogin(): void {
    this.notification.error(`Not Logged In or logging timeout, please try it again.`, ``);
    this.goTo(this.tokenSrv.login_url!);
  }

  private handleData(ev: HttpResponseBase, req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.checkStatus(ev);
    // Deal with some general cases
    switch (ev.status) {
      case 200:
        // I am not sure if error results have the same structures. The best case would be all responses are structured like：

        //  Error Sample:{ status: 1, msg: 'balabala' }
        //  Correct Sample：{ status: 0, response: {  } }

        // If so we can use the snippet below:

        // if (ev instanceof HttpResponse) {
        //   const body = ev.body;
        //   if (body && body.status !== 0) {
        //     this.injector.get(NzMessageService).error(body.msg);
               // WARNING
               // If we throw the error here, the error will be catached by catcherror at line 263.
               // Doing so will interrrupt outer functions like Pipe, Subscribe
               // We can remove line 264 to preserve the outer functions. It depends on usage cases.
        //     return throwError({});
        //   } else {
        //     // Ignore the Bolb
        //     if (ev.body instanceof Blob) {
        //        return of(ev);
        //     }

               // We can either reshape the contents in "body" to be the form of response, ignoring the status code:
        //     return of(new HttpResponse(Object.assign(ev, { body: body.response })));

        //     // Or we just keep the entire response as it is
        //     return of(ev);
        //   }
        // }

        break;
      case 401:
        if (this.refreshTokenEnabled && this.refreshTokenType === 're-request') {
          return this.tryRefreshToken(ev, req, next);
        }
        this.toLogin();
        break;
      case 403:
      case 404:
      case 500:
        // this.goTo(`/exception/${ev.status}?url=${req.urlWithParams}`);
        break;
      default:
        if (ev instanceof HttpErrorResponse) {
          console.warn(
            'Unkown Eroor, may be causes by cross-domain access',
            ev
          );
        }
        break;
    }
    if (ev instanceof HttpErrorResponse) {
      return throwError(ev);
    } else {
      return of(ev);
    }
  }

  private getAdditionalHeaders(headers?: HttpHeaders): { [name: string]: string } {
    const res: { [name: string]: string } = {};
    const lang = this.injector.get(ALAIN_I18N_TOKEN).currentLang;
    if (!headers?.has('Accept-Language') && lang) {
      res['Accept-Language'] = lang;
    }

    return res;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add the url prefix
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      const { baseUrl } = environment.api;
      url = baseUrl + (baseUrl.endsWith('/') && url.startsWith('/') ? url.substring(1) : url);
    }

    const newReq = req.clone({ url, setHeaders: this.getAdditionalHeaders(req.headers) });
    return next.handle(newReq).pipe(
      mergeMap(ev => {
        // Unify the error handle procedure
        if (ev instanceof HttpResponseBase) {
          return this.handleData(ev, newReq, next);
        }
        // Oh yeahhhhh we can continue!
        return of(ev);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err, newReq, next))
    );
  }
}
