import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { ElectronService, Settings, SettingsService } from '../core/services';
import { CommonService } from '../core/services/common.service';
import { RCPService } from '../core/services/rcp.service';
import { RCPRole, RCPUser, RCPWorkplace } from '@olokup/cutter-common';
import { setInterval } from 'timers';

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
    activeSessions: UserSession[] = [];
    workplaceSessions: WorkplaceSession[] = [];

    settingsSubs: Subscription;
    rfidSubs: Subscription;
    rcpInitailizationSubs: Subscription;
    refreshTimerSubs: Subscription;

    isElectron: boolean;

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
            this.rfid = rfid;
            this.actualUser = this.rcpService.users.find(
                (user) => user.rfid === rfid
            );
            this.getSessionForUser();
        });

        this.rcpInitailizationSubs =
            this.rcpService.initializationCompletedSubject.subscribe(
                (completed) => {
                    this.getWorkplace();
                }
            );

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
            const roleId = this.actualUser.role_id;
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
    }

    private getSessionForWorkplace() {
        this.activeSessions = [];
        if (this.workplace) {
            this.rcpService
                .getRCPSessionsForWorkplace(this.workplace.id)
                .subscribe((sessions) => {
                    this.workplaceSessions = sessions.map((session) => ({
                        name: this.rcpService.users.find(
                            (user) => user.id === session.user_id
                        ).eh_user.name,
                        started: session.started,
                        id: session.id,
                        role: this.rcpService.roles.find(
                            (role) => role.id === session.role_id
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
                            (w) => w.id === session.workplace_id
                        );
                        return {
                            started: session.started,
                            workplace: workpl,
                            id: session.id,
                            role: this.rcpService.roles.find(
                                (role) => role.id === session.role_id
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
}
