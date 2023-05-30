import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ElectronService, RCPService, RCPUserDto } from '../../core/services';
import { RCPUser } from '@olokup/cutter-common';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    rfidControl = new FormControl('');

    private paramMapSub: Subscription;
    private onRfidReadSub: Subscription;
    private editUserId: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formbuilder: FormBuilder,
        private rcpService: RCPService,
        private electronService: ElectronService,
        private snackBar: MatSnackBar
    ) {
        this.form = this.formbuilder.group({
            login: this.loginControl,
            name: this.nameControl,
            password: this.passwordControl,
            rfid: this.rfidControl,
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
                        this.rfidControl.setValue(user.rfid);
                        // this.cutterIdControl.setValue(user.cutterId);
                    } else {
                        this.router.navigate(['..', 'users'], {
                            relativeTo: this.route,
                        });
                    }
                });
            }
        });
        this.onRfidReadSub = this.electronService.rfidSubject.subscribe(
            (rfid) => {
                this.rfidControl.setValue(rfid);
            }
        );
    }
    ngOnDestroy(): void {
        if (this.paramMapSub) {
            this.paramMapSub.unsubscribe();
        }
        if (this.onRfidReadSub) {
            this.onRfidReadSub.unsubscribe();
        }
    }

    save(): void {
        if (this.form.valid) {
            const rcpUserDto: RCPUserDto = {
                id: this.editUserId,
                username: this.form.value.username,
                password: this.form.value.password,
                rfid: this.form.value.rfid,
            };
            console.log(this.form.value);
            this.rcpService.updateRCPUser(rcpUserDto).subscribe((res) => {
                if (res.error) {
                    this.snackBar.open(res.error, 'Zamknij', {
                        duration: 3000,
                    });
                } else if (res) {
                    let message = '';
                    // if (this.editUserId) {
                    message = `Użytkownik ${res.username} został zmieniony`;
                    // } else {
                    //   message = `Użytkownik ${res.username} został utworzony`;
                    // }
                    this.snackBar.open(message, 'Zamknij', {
                        duration: 3000,
                    });
                }
                this.router.navigate(['users']);
            });
        }
    }
}
