import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkLogin(state.url);
  }

  checkLogin(url: string): true | Promise<true> | UrlTree {
    if (this.isLoginUrl(url)) {
      return true;
    }
    if (this.authService.isLoggedIn()) {
      // pobranie uprawnień po odświeżeniu strony
      if (!this.authService.loggedUser.user) {
        this.authService
          .getUser()
          .pipe(
            map((user) => {
              this.authService.loggedUser.user = user;
              this.authService.userWasSet.next(true);
              return true;
            })
          )
          .subscribe();
      }
      return true;
    }

    // Store the attempted URL for redirecting
    // this.authService.redirectUrl = url;

    // Redirect to the login page
    console.log('Not logged in');
    return this.router.parseUrl('/auth/login');
  }

  isLogoutUrl(url: string): boolean {
    if (url === '/auth/logout') {
      this.authService.logout();
      return true;
    }
    return false;
  }

  isLoginUrl(url: string): boolean {
    if (url === '/auth/login') {
      return true;
    }
    return false;
  }
}
