import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        MatButtonModule,
        MatSidenavModule,
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatSnackBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatTableModule,
        MatCheckboxModule,
    ],
    exports: [
        MatButtonModule,
        MatSidenavModule,
        MatToolbarModule,
        MatMenuModule,
        MatIconModule,
        MatSnackBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatTableModule,
        MatCheckboxModule,
    ],
})
export class MaterialModule {}
