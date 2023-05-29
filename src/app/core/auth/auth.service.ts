import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RCPUser, User } from '@olokup/cutter-common';
import {
    BehaviorSubject,
    Observable,
    Subject,
    catchError,
    of,
    shareReplay,
    tap,
} from 'rxjs';
import { SettingsService } from '../services/settings.service';
import jwt_decode from 'jwt-decode';
import { AuthInterceptor } from './auth-interceptor';

export interface AuthResult {
    accessToken: string;
    expiresIn: number;
    username: string;
    user: User;
}
export interface AuthError {
    error: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    userWasSet = new BehaviorSubject<RCPUser>(undefined);

    private loggedUser: RCPUser;
    private jwtToken: string;

    constructor(
        private http: HttpClient,
        private settingsService: SettingsService,
        private authInterceptors: AuthInterceptor
    ) {
        const jwtToken = localStorage.getItem('id_token');
        const expiresAt: number = +localStorage.getItem('expires_at');
        const loggedUser = localStorage.getItem('loggedUser');
        this.loggedUser = JSON.parse(loggedUser);

        const now = new Date();
        let jwtUsername = '';
        if (jwtToken && jwtToken.length > 0) {
            jwtUsername = jwt_decode<any>(jwtToken).username;
        }

        const isTokenValid =
            jwtToken &&
            jwtToken.length > 0 &&
            now.getSeconds() < expiresAt &&
            jwtUsername &&
            jwtUsername.length > 0 &&
            jwtUsername.toUpperCase() ===
                this.loggedUser?.ehUser?.username?.toUpperCase();

        // console.log(isTokenValid);
        if (isTokenValid) {
            this.jwtToken = jwtToken;
            this.authInterceptors.setToken(this.jwtToken);
            this.getRCPUser(this.loggedUser.id).subscribe((user) => {
                if (user) {
                    this.loggedUser = user;
                    this.userWasSet.next(this.loggedUser);
                } else {
                    this.logout();
                }
            });
        } else {
            this.logout();
        }
    }

    login(username: string, password: string): Observable<any> {
        const url = [
            this.settingsService.settings.config.api.server,
            'auth',
            'login',
        ].join('/');
        if (!password) {
            password = ' ';
        }
        return this.http.post<any>(url, { username, password }).pipe(
            catchError(this.handleError),
            tap((res) => {
                if (!res.error) {
                    const user: User = res.user;
                    this.setSession({
                        accessToken: res.access_token,
                        expiresIn: res.expires_in,
                        user,
                        username: res.username,
                    });
                }
            }),
            shareReplay()
        );
    }

    loginByRFID(rfid: string): void {}

    getToken(): string {
        return this.jwtToken;
    }

    logout(): void {
        console.log('logout');
        this.jwtToken = undefined;
        this.authInterceptors.setToken(this.jwtToken);
        this.loggedUser = undefined;
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('loggedUser');
        this.userWasSet.next(this.loggedUser);
    }

    public isLoggedIn(): boolean {
        const now = new Date();
        if (
            this.jwtToken &&
            now.getSeconds() < this.getExpiration().getSeconds()
        ) {
            return true;
        }
        return false;
    }

    isLoggedOut(): boolean {
        return !this.isLoggedIn();
    }

    getUsername(): string {
        if (this.loggedUser.ehUser) {
            return this.loggedUser.ehUser.username;
        } else {
            return '';
        }
    }

    getLoggedUser(): RCPUser {
        if (this.loggedUser) {
            return this.loggedUser;
        } else {
            return undefined;
        }
    }

    // getUser(): Observable<User> {
    //     if (this.loggedUser) {
    //         return this.userService.getUser(this.loggedUser.id).pipe(
    //             tap((user) => {
    //                 if (user) {
    //                     const jwt_user = jwt_decode(this.jwtToken)['username'];
    //                     if (jwt_user !== user.username) {
    //                         this.logout();
    //                     }
    //                 } else {
    //                     this.logout();
    //                 }
    //             })
    //         );
    //     } else {
    //         this.logout();
    //     }
    //     return undefined;
    // }

    getLoggedUserId(): number {
        return this.loggedUser.id;
    }

    public isAdmin(): boolean {
        if (this.loggedUser) {
            return true;
        } else {
            return false;
        }
    }

    private handleError(
        error: HttpErrorResponse
    ): Observable<{ error: string }> {
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, body was: `,
                error.error
            );
        }
        // Return an observable with a user-facing error message.
        return of({
            error: 'Invalid username or password',
        });
    }
    private setSession(authResult: AuthResult): void {
        const now = new Date();
        const expiresAt = now.setSeconds(
            now.getSeconds(),
            +authResult.expiresIn
        );
        this.jwtToken = authResult.accessToken;
        this.authInterceptors.setToken(this.jwtToken);

        const rcpuser = this.getRCPUser(authResult.user.userId).subscribe(
            (user) => {
                if (user) {
                    this.loggedUser = user;
                    this.loggedUser.ehUser.password = '';
                    localStorage.setItem('id_token', authResult.accessToken);
                    localStorage.setItem(
                        'expires_at',
                        JSON.stringify(expiresAt.valueOf())
                    );
                    localStorage.setItem(
                        'loggedUser',
                        JSON.stringify(this.loggedUser)
                    );
                    this.userWasSet.next(this.loggedUser);
                }
            }
        );
    }

    private getExpiration(): Date {
        const expiration = localStorage.getItem('expires_at');
        const expiresAt = JSON.parse(expiration);
        return expiresAt;
    }

    private getRCPUser(id: number): Observable<RCPUser> {
        const url = [
            this.settingsService.settings.config.api.server,
            'rcp',
            'users',
            id,
        ].join('/');
        return this.http.get<RCPUser>(url).pipe(
            tap((res) => {
                console.log(res);
            })
        );
    }
}
