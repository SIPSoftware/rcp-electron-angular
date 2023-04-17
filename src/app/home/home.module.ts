import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { MaterialModule } from '../shared/material.module';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
    declarations: [HomeComponent, SettingsComponent],
    imports: [
        CommonModule,
        SharedModule,
        HomeRoutingModule,
        CoreModule,
        MaterialModule,
    ],
})
export class HomeModule {}
