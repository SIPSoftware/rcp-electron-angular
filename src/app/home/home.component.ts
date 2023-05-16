import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ElectronService, Settings, SettingsService } from '../core/services';
import { CommonService } from '../core/services/common.service';
import { RCPService } from '../core/services/rcp.service';
import { RCPWorkplace } from '@olokup/cutter-common';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    settings: Settings;
    workplace: RCPWorkplace;
    rfid: string;

    settingsSubs: Subscription;
    rfidSubs: Subscription;
    rcpInitailizationSubs: Subscription;

    constructor(
        private router: Router,
        private electronService: ElectronService,
        private settingsService: SettingsService,
        private commonService: CommonService,
        private rcpService: RCPService
    ) {}

    afterConfigChanged(): void {
        this.getWorkplace();
    }

    ngOnDestroy(): void {
        if (this.settingsSubs) {
            this.settingsSubs.unsubscribe();
        }
        if (this.rfidSubs) {
            this.rfidSubs.unsubscribe();
        }
        if (this.rcpInitailizationSubs) {
            this.rcpInitailizationSubs.unsubscribe();
        }
    }

    ngOnInit(): void {
        if (!this.electronService.isElectron) {
            this.settings = this.settingsService.settings;
            this.afterConfigChanged();
        }
        this.settingsSubs = this.settingsService.settingsSubject.subscribe(
            (settings) => {
                this.settings = settings;
                this.afterConfigChanged();
            }
        );
        this.rfidSubs = this.electronService.rfidSubject.subscribe((rfid) => {
            this.rfid = rfid;
        });

        this.rcpInitailizationSubs =
            this.rcpService.initializationCompletedSubject.subscribe(
                (completed) => {
                    this.getWorkplace();
                }
            );
    }

    onPrimaryBtnClick(): void {}

    private getWorkplace() {
        this.workplace = this.rcpService.workplaces.find(
            (n) => n.id === +this.settings.config.stanowisko.numer
        );
    }
}
