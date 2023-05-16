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
export class CommonService {
    productionNodesSubject: Subject<ProductionNode[]>;

    constructor(
        private http: HttpClient,
        private settingsService: SettingsService
    ) {}

    getAllProductionNodes(): Observable<ProductionNode[]> {
        console.log('getAllProductionNodes():', this.settingsService.settings);
        return this.http.get<ProductionNode[]>(
            [this.settingsService.settings.config.api.server, 'plan/node'].join(
                '/'
            )
        );
    }
}
