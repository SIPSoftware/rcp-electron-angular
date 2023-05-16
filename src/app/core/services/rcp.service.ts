import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    ProductionNode,
    RCPDepartment,
    RCPWorkplace,
} from '@olokup/cutter-common';
import { Observable, Subject, tap } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root',
})
export class RCPService {
    initializationCompletedSubject = new Subject<boolean>();

    departments: RCPDepartment[] = [];
    workplaces: RCPWorkplace[] = [];

    private fetchDepartmentsCompleted: boolean;
    private fetchWorplacesCompleted: boolean;

    constructor(
        private http: HttpClient,
        private settingsService: SettingsService
    ) {
        this.initializeData();
    }

    private initializeData() {
        this.fetchDepartmentsCompleted = false;
        this.fetchWorplacesCompleted = false;

        this.getAllRCPDepartments().subscribe((departments) => {
            console.log(departments);
            this.departments = departments;
            this.fetchDepartmentsCompleted = true;
            this.initializationCompleted();
        });

        this.getAllRCPWorkplaces().subscribe((workplaces) => {
            console.log(workplaces);
            this.workplaces = workplaces;
            this.fetchWorplacesCompleted = true;
            this.initializationCompleted();
        });
    }

    private initializationCompleted() {
        if (this.fetchDepartmentsCompleted && this.fetchWorplacesCompleted) {
            console.log('initialization completed');
            this.initializationCompletedSubject.next(true);
        }
    }

    private getAllRCPDepartments(): Observable<RCPDepartment[]> {
        console.log('getAllRCPDepartmants():', this.settingsService.settings);
        return this.http.get<RCPDepartment[]>(
            [
                this.settingsService.settings.config.api.server,
                'rcp/departments',
            ].join('/')
        );
    }

    private getAllRCPWorkplaces(): Observable<RCPWorkplace[]> {
        console.log('getAllRCPWorkplaces():', this.settingsService.settings);
        return this.http.get<RCPWorkplace[]>(
            [
                this.settingsService.settings.config.api.server,
                'rcp/workplaces',
            ].join('/')
        );
    }
}
