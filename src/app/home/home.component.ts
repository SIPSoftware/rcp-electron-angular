import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../app/src/interfaces/config.interface';
import { ElectronService, Settings, SettingsService } from '../core/services';
import { ProductionNode } from '@olokup/cutter-common';
import { CommonService } from '../core/services/common.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    settings: Settings = {
        config: {
            instalacja: {
                numer: 10,
            },
        },
    };
    productionNodeName: string;

    settingsSubs: Subscription;
    productionNodesSubs: Subscription;

    constructor(
        private router: Router,
        private electronService: ElectronService,
        private settingsService: SettingsService,
        private commonService: CommonService
    ) {}

    afterConfigChanged(): void {
        this.commonService.getAllProductionNodes().subscribe((nodes) => {
            // this.electronService.getAllProductionnodes().subscribe((nodes) => {
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
    }

    ngOnInit(): void {
        if (!this.electronService.isElectron) {
            this.afterConfigChanged();
        }
        this.settingsSubs = this.settingsService.settingsSubject.subscribe(
            (settings) => {
                this.settings = settings;
                this.afterConfigChanged();
            }
        );
    }
}
