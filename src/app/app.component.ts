import { Component, OnDestroy, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { Subscription } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { RCPUser } from '@olokup/cutter-common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    userWasSetSubs: Subscription;
    loggedUser: RCPUser;

    constructor(
        private electronService: ElectronService,
        private authService: AuthService,
        private translate: TranslateService
    ) {
        this.translate.setDefaultLang('en');
        console.log('APP_CONFIG', APP_CONFIG);

        if (electronService.isElectron) {
            console.log(process.env);
            console.log('Run in electron');
            console.log(
                'Electron ipcRenderer',
                this.electronService.ipcRenderer
            );
            console.log(
                'NodeJS childProcess',
                this.electronService.childProcess
            );
        } else {
            console.log('Run in browser');
        }
    }

    ngOnInit(): void {
        this.userWasSetSubs = this.authService.userWasSet.subscribe((user) => {
            this.loggedUser = user;
        });
    }
    ngOnDestroy(): void {
        if (this.userWasSetSubs) {
            this.userWasSetSubs.unsubscribe();
        }
    }
}
