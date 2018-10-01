import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { Subject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/internal/operators/delay';
import { tap } from 'rxjs/internal/operators/tap';
import { map } from 'rxjs/internal/operators/map';
import { Answer } from '../models/answer';
import { ColumnName } from '../models/column-name';
import { columnNames } from '../data/column-names';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { merge } from 'rxjs/internal/observable/merge';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { startWith } from 'rxjs/internal/operators/startWith';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';

@Component({
  selector: 'app-reactive',
  templateUrl: './reactive.component.html',
  styleUrls: ['./reactive.component.css'],
})
export class ReactiveComponent implements AfterViewInit {


  @ViewChild('input') readonly input;

  /** форма */
  readonly searchInput = new Subject<string>();
  /** Поток формы */
  readonly searchInput$ = this.searchInput.asObservable().pipe(
    debounceTime(400),
    tap(() => this.randomButton.next(false)),
    distinctUntilChanged(),
  )

  readonly columnNamesClick = new Subject<string>();
  /** Поток выбора колонны */
  readonly columnNamesClick$ = this.columnNamesClick.asObservable().pipe(
    distinctUntilChanged()
  )

  
  
  /** кнопка формы */
  readonly randomButton = new Subject();
  /** Поток кнопки */
  readonly randomButton$ = this.randomButton.asObservable().pipe(
    distinctUntilChanged()
  )


  
  readonly error: Subject<string> = new Subject<string>();
  /**Поток вывода ошибок */
  readonly error$: Observable<string> = this.error.asObservable();

  readonly spinner: Subject<boolean> = new Subject<boolean>();
  /**Поток спиннера */
  readonly spinner$: Observable<boolean> = this.spinner.asObservable();

  readonly tableData$: Observable<Answer[]> = combineLatest(
    this.searchInput$, 
    this.randomButton$, 
    this.columnNamesClick$)
    .pipe(
      tap(() => this.spinner.next(true)),
      switchMap(([searchInput, randomButton, columnName]) =>
        this._dataService.getData(searchInput, randomButton, columnName).pipe(
          tap(() => this.error.next()),
          catchError(error => {
            this.error.next(error.message)
            return of([])
          }
        )),
      ),
      tap(() => this.spinner.next(false)),
    )

  
  /** Имена колонок */
  readonly columnNames: ColumnName[] = columnNames;

  constructor(private _dataService: DataService) {}

  ngAfterViewInit() {
    this.columnNamesClick.next('title');
    this.searchInput.next('');
  }

}
