import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { AppConfig } from '../../interfaces/config.interface';
import { Observable, Subject, Subscription } from 'rxjs';
import { ElectronService } from './electron/electron.service';

export interface Settings {
    config: AppConfig;
}

@Injectable({
    providedIn: 'root',
})
export class SettingsService implements OnDestroy {
    settings: Settings;

    settingsSubject = new Subject<Settings>();

    private configSubs: Subscription;

    constructor(private electronService: ElectronService) {
        if (!this.electronService.isElectron) {
            this.settings = {
                config: {
                    instalacja: {
                        numer: 5,
                    },
                    api: {
                        server: 'http://localhost:3000',
                    },
                    rfid: {
                        port: 'COM5',
                    },
                },
            };
            this.afterSettingsChanged();
        }
        this.configSubs = this.electronService.configSubject.subscribe(
            (config) => {
                this.settings = { ...this.settings, config };
                this.afterSettingsChanged();
            }
        );
    }

    ngOnDestroy(): void {
        if (this.configSubs) {
            this.configSubs.unsubscribe();
        }
    }

    private afterSettingsChanged() {
        this.settingsSubject.next(this.settings);
    }
}
