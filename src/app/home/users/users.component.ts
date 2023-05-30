import { Component, OnDestroy, OnInit } from '@angular/core';
import { RCPService } from '../../core/services';
import { Subscription } from 'rxjs';
import { RCPRole, RCPUser, User } from '@olokup/cutter-common';
import { NgForm } from '@angular/forms';

interface RowData {
    id: number;
    name: string;
    department: string;
    active: boolean;
    rfid: string;
    // roleId: number;
    // tempRoleId: number;
    // tempStartDate: Date;
    // tempEndDate: Date;
    // permissionGroupId: number;
    // modifiedBy: string;
    // modifiedDate: Date;
    // active: number;
    // ehUser?: User;
    // role: RCPRole;
    // permissions: string;
}

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
    rcpUsers: RCPUser[] = [];
    data: RowData[];
    displayedColumns = ['name', 'department', 'rfid', 'active', 'modify_btn'];
    filter = '';

    private usersSubs: Subscription;
    private initializationCompletedSubs: Subscription;

    constructor(private rcpService: RCPService) {}

    ngOnInit(): void {
        // this.usersSubs = this.rcpService.getAllRCPUsers().subscribe((users) => {
        //     this.rcpUsers = users;
        //     this.filterItems();
        // });
        this.initializationCompletedSubs =
            this.rcpService.initializationCompletedSubject.subscribe(
                (result) => {
                    // this.rcpUsers = this.rcpService.users;
                    // this.filterItems();
                    if (result) {
                        this.rcpService.getAllRCPUsers().subscribe((users) => {
                            this.rcpUsers = users;
                            this.filterItems();
                        });
                    }
                }
            );
    }

    ngOnDestroy(): void {
        if (this.usersSubs) {
            this.usersSubs.unsubscribe();
        }
        if (this.initializationCompletedSubs) {
            this.initializationCompletedSubs.unsubscribe();
        }
    }

    filterItems(): void {
        const filteredUsers = this.rcpUsers;
        // .filter((user) =>{
        //     const joinedString = user.ehUser.name.toLowerCase() + user.
        // }
        //     .includes(this.filter.toLowerCase())
        // );
        const filteredData = filteredUsers
            .map((user) => ({
                id: user.id,
                name: user.ehUser.name,
                department: this.rcpService.departments.find(
                    (d) => d.id === user.departmentId
                )?.name,
                active: user.active === 1,
                rfid: user.rfid,
            }))
            .filter((d) => {
                // console.log(d);
                const joinedString =
                    d.name?.toLowerCase() +
                    d.rfid +
                    d.department?.toLowerCase();
                return joinedString.includes(this.filter.toLowerCase());
            });
        this.data = filteredData;
    }

    onFilter(form: NgForm): void {
        this.filter = form.value.filter;
        this.filterItems();
    }
}
