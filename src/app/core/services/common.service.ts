import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductionNode } from '@olokup/cutter-common';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommonService {
    productionNodesSubject: Subject<ProductionNode[]>;

    constructor(private http: HttpClient) {}

    getAllProductionNodes(): Observable<ProductionNode[]> {
        return this.http.get<ProductionNode[]>(
            'http://localhost:3000/plan/node'
        );
    }
}
