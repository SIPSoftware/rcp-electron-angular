import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ElectronService, Settings, SettingsService } from '../core/services';
import { CommonService } from '../core/services/common.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    settings: Settings;
    productionNodeName: string;
    rfid: string;

    settingsSubs: Subscription;
    rfidSubs: Subscription;

    constructor(
        private router: Router,
        private electronService: ElectronService,
        private settingsService: SettingsService,
        private commonService: CommonService
    ) {}

    afterConfigChanged(): void {
        this.commonService.getAllProductionNodes().subscribe((nodes) => {
            const node = nodes.find(
                (n) => n.id === +this.settings.config.instalacja.numer
            );
            console.log(this.settings.config.instalacja.numer, node);
            if (node) {
                this.productionNodeName = node.name;
            } else {
                this.productionNodeName = 'Niepoprawna instalacja';
            }
        });
    }

    ngOnDestroy(): void {
        if (this.settingsSubs) {
            this.settingsSubs.unsubscribe();
        }
        if (this.rfidSubs) {
            this.rfidSubs.unsubscribe();
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
    }

    onPrimaryBtnClick(): void {}
}
