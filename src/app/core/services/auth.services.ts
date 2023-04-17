import { Injectable } from '@angular/core';
import { User } from '@olokup/cutter-common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    loggedUser: User;

    login(username: string, password: string): void {}

    loginByRFID(rfid: string): void {}
}
