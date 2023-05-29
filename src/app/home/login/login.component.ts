import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    form: FormGroup;
    hidepassword = true;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) {
        this.form = this.fb.group({
            email: ['', Validators.required],
            password: [''],
        });
    }
    login() {
        const val = this.form.value;

        if (val.email) {
            this.authService.login(val.email, val.password).subscribe((res) => {
                if (res.error) {
                    this.snackBar.open(res.error, 'Zamknij', {
                        duration: 3000,
                    });
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }
}
