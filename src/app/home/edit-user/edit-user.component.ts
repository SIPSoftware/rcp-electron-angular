import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from 'playwright';
import { Subscription } from 'rxjs';
import { RCPService } from '../../core/services';
import { RCPUser } from '@olokup/cutter-common';

@Component({
    selector: 'app-edit-user',
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.scss'],
})
export class EditUserComponent implements OnInit, OnDestroy {
    hidePassword = true;
    form: FormGroup;
    rcpUser: RCPUser;

    nameControl = new FormControl('', Validators.required);
    loginControl = new FormControl('', Validators.required);
    passwordControl = new FormControl('', Validators.required);

    private paramMapSub: Subscription;
    private editUserId: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formbuilder: FormBuilder,
        private rcpService: RCPService
    ) {
        this.form = formbuilder.group({
            login: this.loginControl,
            name: this.nameControl,
            password: this.passwordControl,
        });
    }

    ngOnInit(): void {
        this.paramMapSub = this.route.paramMap.subscribe((params) => {
            const userId = +params.get('userId');
            if (userId) {
                this.rcpService.getRCPUser(userId).subscribe((user) => {
                    if (user) {
                        this.editUserId = userId;
                        this.loginControl.setValue(user.ehUser.username);
                        this.nameControl.setValue(user.ehUser.name);
                        this.passwordControl.setValue(user.ehUser.password);
                        // this.cutterIdControl.setValue(user.cutterId);
                    } else {
                        this.router.navigate(['..', 'users'], {
                            relativeTo: this.route,
                        });
                    }
                });
            }
        });
    }
    ngOnDestroy(): void {
        if (this.paramMapSub) {
            this.paramMapSub.unsubscribe();
        }
    }

    save(): void {}
}
