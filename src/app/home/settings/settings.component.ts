import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
    ElectronService,
    Settings,
    SettingsService,
} from '../../core/services';

@Component({
    selector: 'app-home',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
    formattedSettings: string;
    settings: Settings;

    settingsSubs: Subscription;

    constructor(private settingsService: SettingsService) {}

    ngOnInit(): void {
        this.formatSettings(this.settingsService.settings);
        console.log(this.formattedSettings);
        this.settingsSubs = this.settingsService.settingsSubject.subscribe(
            (settings) => {
                this.formatSettings(settings);
                console.log(this.formattedSettings);
                this.settings = settings;
            }
        );
    }
    ngOnDestroy(): void {
        if (this.settingsSubs) {
            this.settingsSubs.unsubscribe();
        }
    }

    private formatSettings(settings: Settings): void {
        this.formattedSettings = JSON.stringify(settings, null, 3);
    }
}
