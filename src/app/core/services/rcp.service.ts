import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    RCPDepartment,
    RCPRole,
    RCPSession,
    RCPUser,
    RCPWorkplace,
} from '@olokup/cutter-common';
import { BehaviorSubject, Observable, Subject, Subscription, tap } from 'rxjs';
import { SettingsService } from './settings.service';
import { ElectronService } from './electron/electron.service';

@Injectable({
    providedIn: 'root',
})
export class RCPService {
    initializationCompletedSubject = new BehaviorSubject<boolean>(false);

    departments: RCPDepartment[] = [];
    workplaces: RCPWorkplace[] = [];
    users: RCPUser[] = [];
    roles: RCPRole[] = [];

    private fetchDepartmentsCompleted: boolean;
    private fetchWorplacesCompleted: boolean;
    private fetchUsersCompleted: boolean;
    private fetchRolesCompleted: boolean;

    private settingsSubs: Subscription;

    constructor(
        private http: HttpClient,
        private electronService: ElectronService,
        private settingsService: SettingsService
    ) {
        this.settingsSubs = this.settingsService.settingsSubject.subscribe(
            (settings) => {
                if (settings) {
                    this.initializeData();
                }
            }
        );
        if (!this.electronService.isElectron) {
            this.initializeData();
        }
    }

    getRCPSessionsForUser(userId: number): Observable<RCPSession[]> {
        console.log('getRCPSessionsForUser():', this.settingsService.settings);
        return this.http.get<RCPSession[]>(
            [
                this.settingsService.settings.config.api.server,
                'rcp',
                'user_active_sessions',
                userId,
            ].join('/')
        );
    }

    getRCPSessionsForWorkplace(workplaceId: number): Observable<RCPSession[]> {
        console.log(
            'getRCPSessionsForWorkplace():',
            this.settingsService.settings
        );
        return this.http.get<RCPSession[]>(
            [
                this.settingsService.settings.config.api.server,
                'rcp',
                'workplace_active_sessions',
                workplaceId,
            ].join('/')
        );
    }

    createSession(
        userId: number,
        workplaceId: number,
        roleId: number,
        sessionType: number
    ): Observable<number> {
        const body: {
            userId: number;
            workplaceId: number;
            roleId: number;
            operator: string;
            sessionType: number;
        } = {
            userId,
            workplaceId,
            roleId,
            sessionType,
            operator: 'NODE',
        };
        return this.http.put<number>(
            [
                this.settingsService.settings.config.api.server,
                'rcp',
                'create_session',
            ].join('/'),
            body
        );
    }

    closeSession(sessionId: number): Observable<number> {
        const body: {
            sessionId: number;
            operator: string;
        } = {
            sessionId,
            operator: 'NODE',
        };
        return this.http.put<number>(
            [
                this.settingsService.settings.config.api.server,
                'rcp',
                'close_session',
            ].join('/'),
            body
        );
    }

    getRCPUser(id: number): Observable<RCPUser> {
        const url = [
            this.settingsService.settings.config.api.server,
            'rcp',
            'users',
            id,
        ].join('/');
        console.log(url);
        return this.http.get<RCPUser>(url).pipe(
            tap((res) => {
                console.log(res);
            })
        );
    }

    getAllRCPUsers(): Observable<RCPUser[]> {
        console.log('getAllRCPUsers():', this.settingsService.settings);
        return this.http.get<RCPUser[]>(
            [this.settingsService.settings.config.api.server, 'rcp/users'].join(
                '/'
            )
        );
    }

    getAllRCPDepartments(): Observable<RCPDepartment[]> {
        console.log('getAllRCPDepartmants():', this.settingsService.settings);
        return this.http
            .get<RCPDepartment[]>(
                [
                    this.settingsService.settings.config.api.server,
                    'rcp/departments',
                ].join('/')
            )
            .pipe(
                tap((d) => {
                    this.departments = d;
                })
            );
    }

    private initializeData() {
        this.fetchDepartmentsCompleted = false;
        this.fetchWorplacesCompleted = false;
        this.fetchUsersCompleted = false;
        this.fetchRolesCompleted = false;

        this.getAllRCPDepartments().subscribe((departments) => {
            //console.log(departments);
            this.fetchDepartmentsCompleted = true;
            this.initializationCompleted();
        });

        this.getAllRCPWorkplaces().subscribe((workplaces) => {
            //console.log(workplaces);
            this.workplaces = workplaces;
            this.fetchWorplacesCompleted = true;
            this.initializationCompleted();
        });

        this.getAllRCPUsers().subscribe((users) => {
            //            console.log(users);
            this.users = users;
            this.fetchUsersCompleted = true;
            this.initializationCompleted();
        });

        this.getAllRCPRoles().subscribe((roles) => {
            this.roles = roles;
            this.fetchRolesCompleted = true;
            this.initializationCompleted();
        });
    }

    private initializationCompleted() {
        if (
            this.fetchDepartmentsCompleted &&
            this.fetchWorplacesCompleted &&
            this.fetchUsersCompleted
        ) {
            this.initializationCompletedSubject.next(true);
        }
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

    private getAllRCPRoles(): Observable<RCPRole[]> {
        console.log('getAllRCPUsers():', this.settingsService.settings);
        return this.http.get<RCPRole[]>(
            [
                this.settingsService.settings.config.api.server,
                'rcp',
                'roles',
            ].join('/')
        );
    }
}
