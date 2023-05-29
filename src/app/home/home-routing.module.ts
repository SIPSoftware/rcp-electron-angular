import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'settings',
        component: SettingsComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
];

@NgModule({
    declarations: [],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HomeRoutingModule {}
