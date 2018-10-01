import { Injectable } from '@angular/core';
import { data } from '../data/data';
import { Answer } from '../models/answer';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { delay } from 'rxjs/internal/operators/delay';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError } from 'rxjs/internal/operators/catchError';

@Injectable()
export class DataService {

    callingCount: number = 0;

    getData(searchInput, randomButton, columnName): Observable<Answer[]> {
        return of(data).pipe(
            
            tap(_ => this.callingCount++),
            map( (data: Answer[]) => {
                
                if (this.callingCount % 3 === 0) throw new Error('404');
                
                
                return data.filter(
                    item => {
                        if (searchInput === '') return true;
                        let itemLowerCase = item[columnName].toLowerCase();
                        return itemLowerCase.indexOf(searchInput.toLowerCase()) >= 0;
                    }
                )
            })
        )
    }

}
