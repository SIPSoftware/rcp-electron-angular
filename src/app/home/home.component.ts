import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../app/interfaces/config.interface';
import { ElectronService } from '../core/services';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    config: AppConfig = {
        instalacja: {
            numer: 10,
        },
    };
    configSubs: Subscription;

    constructor(
        private router: Router,
        private electronService: ElectronService
    ) {
        this.configSubs = this.electronService.configSubject.subscribe(
            (config) => {
                this.config = config;
            }
        );
    }
    ngOnDestroy(): void {
        if (this.configSubs) {
            this.configSubs.unsubscribe();
        }
    }

    ngOnInit(): void {
        console.log('HomeComponent INIT');
    }
}
