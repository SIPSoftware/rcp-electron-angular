import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { MaterialModule } from '../shared/material.module';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { EditUserComponent } from './edit-user/edit-user.component';

@NgModule({
    declarations: [HomeComponent, SettingsComponent, LoginComponent, UsersComponent, EditUserComponent],
    imports: [
        CommonModule,
        SharedModule,
        HomeRoutingModule,
        CoreModule,
        ReactiveFormsModule,
        MaterialModule,
    ],
})
export class HomeModule {}
