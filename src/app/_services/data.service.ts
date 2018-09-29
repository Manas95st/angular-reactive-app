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

    // индикатор спиннера
    loader: boolean = false;
    // подсчет запросов
    callingCount: number = 0;
    
    constructor() { 
    }

    getData(searchWord$: Observable<string>, columnName$: Observable<string>): Observable<Answer[] | string> {
        // выводим имени колонны из потока
        let columnName; 
        columnName$.subscribe((value) => { columnName = value;});
        // основной поток
        return searchWord$.pipe(
            debounceTime(400), 
            // включаем спиннер, считаем запросы
            tap(() => { this.loader = true; this.callingCount++;}),
            delay(1000),
            // переключаемся к фейковому апи
            switchMap( (word) => this.fakeApi( word, columnName))
        )
    }

    fakeApi(word: string, columnName) {
        // Данные из data
        return of(data)
            .pipe(
                map((data: Answer[]) => {
                    // каждый третий запрос возвращает ошибку
                    if (this.callingCount % 3 === 0) throw new Error('404');
                    // фильтруем данные по форме
                    return data.filter(
                        item => {
                            if (word === '') return true;
                            let itemLowerCase = item[columnName].toLowerCase();
                            return itemLowerCase.indexOf(word.toLowerCase()) >= 0;
                        }
                    )
                }),
                catchError(data => {
                    return of('Данные не получены');
                }),
                delay(1000),
                // выключаем спиннер
                tap(() => this.loader = false),
                
            )
    }

    isLoading() {
        return this.loader;
    }

    

}
