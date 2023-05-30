import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { ElectronService, Settings, SettingsService } from '../core/services';
import { RCPService } from '../core/services/rcp.service';
import { RCPRole, RCPUser, RCPWorkplace } from '@olokup/cutter-common';
import { setInterval } from 'timers';
import { AuthService } from '../core/auth/auth.service';
import {
    UserPermission,
    getUserPermissions,
} from '../shared/helpers/permission.helper';
import { MatSnackBar } from '@angular/material/snack-bar';

interface UserSession {
    id: number;
    workplace: RCPWorkplace;
    started: Date;
    role: RCPRole;
}

interface WorkplaceSession {
    id: number;
    name: string;
    started: Date;
    role: RCPRole;
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    settings: Settings;
    workplace: RCPWorkplace;
    rfid: string;
    actualUser: RCPUser;
    actualPermission: UserPermission;
    activeSessions: UserSession[] = [];
    workplaceSessions: WorkplaceSession[] = [];

    settingsSubs: Subscription;
    rfidSubs: Subscription;
    rcpInitailizationSubs: Subscription;
    refreshTimerSubs: Subscription;
    userWasSetSubs: Subscription;

    isElectron: boolean;

    private snackBar: MatSnackBar;

    constructor(
        private electronService: ElectronService,
        private settingsService: SettingsService,
        private rcpService: RCPService,
        private authService: AuthService
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
        if (this.userWasSetSubs) {
            this.userWasSetSubs.unsubscribe();
        }
    }

    ngOnInit(): void {
        this.isElectron = this.electronService.isElectron;
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
            console.log(rfid);
            if (rfid && rfid.length > 0) {
                this.authService.loginByRFID(rfid).subscribe((res) => {
                    if (res.error) {
                        this.snackBar.open(res.error, 'Zamknij', {
                            duration: 3000,
                        });
                    }
                });
            }
        });

        this.rcpInitailizationSubs =
            this.rcpService.initializationCompletedSubject.subscribe(
                (completed) => {
                    this.getWorkplace();
                }
            );

        this.userWasSetSubs = this.authService.userWasSet.subscribe((user) => {
            this.actualUser = user;
            this.rfid = user?.rfid || undefined;
            if (user) {
                this.getUserPermissions();
                this.getSessionForUser();
            }
        });

        setInterval(() => {
            this.refreshData();
        }, 30000);
    }

    onButton1Click(): void {
        this.electronService.rfidSubject.next('7418399');
    }
    onButton2Click(): void {
        this.electronService.rfidSubject.next('7353966');
    }
    onButton3Click(): void {
        this.electronService.rfidSubject.next('7191020');
    }

    onStartSessionClick() {
        if (this.actualUser && this.workplace) {
            const roleId = this.actualUser.roleId;
            this.rcpService
                .createSession(this.actualUser.id, this.workplace.id, roleId, 0)
                .subscribe((sessionId) => {
                    console.log('new session created: ', sessionId);
                    this.refreshData();
                });
        }
    }

    onEndSessionClick(sessionId: number) {
        if (sessionId > 0) {
            this.rcpService.closeSession(sessionId).subscribe((result) => {
                this.refreshData();
            });
        }
    }

    private getWorkplace() {
        this.workplace = this.rcpService.workplaces.find(
            (n) => n.id === +this.settings.config.stanowisko.numer
        );
        this.getSessionForWorkplace();
        this.getUserPermissions();
    }

    private getSessionForWorkplace() {
        this.activeSessions = [];
        if (this.workplace) {
            this.rcpService
                .getRCPSessionsForWorkplace(this.workplace.id)
                .subscribe((sessions) => {
                    this.workplaceSessions = sessions.map((session) => ({
                        name: this.rcpService.users.find(
                            (user) => user.id === session.userId
                        ).ehUser.name,
                        started: session.started,
                        id: session.id,
                        role: this.rcpService.roles.find(
                            (role) => role.id === session.roleId
                        ),
                    }));
                });
        }
    }
    private getSessionForUser() {
        if (this.actualUser) {
            this.rcpService
                .getRCPSessionsForUser(this.actualUser.id)
                .subscribe((sessions) => {
                    this.activeSessions = sessions.map((session) => {
                        const workpl = this.rcpService.workplaces.find(
                            (w) => w.id === session.workplaceId
                        );
                        return {
                            started: session.started,
                            workplace: workpl,
                            id: session.id,
                            role: this.rcpService.roles.find(
                                (role) => role.id === session.roleId
                            ),
                        };
                    });
                });
        }
    }

    private refreshData() {
        this.getSessionForUser();
        this.getSessionForWorkplace();
    }

    private getUserPermissions() {
        if (this.actualUser && this.workplace) {
            this.actualPermission = getUserPermissions(
                this.workplace,
                this.actualUser.permissions
            );
        }
    }
}
