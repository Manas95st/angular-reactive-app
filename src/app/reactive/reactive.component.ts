import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { DataService } from '../_services/data.service';
import { Subject, Observable } from 'rxjs';
import { delay } from 'rxjs/internal/operators/delay';
import { Answer } from '../models/answer';
import { ColumnName } from '../models/column-name';
import { columnNames } from '../data/column-names';

@Component({
  selector: 'app-reactive',
  templateUrl: './reactive.component.html',
  styleUrls: ['./reactive.component.css'],
})
export class ReactiveComponent implements AfterViewInit {

  // ссылка для формы ввода
  @ViewChild('input') input;
  // ответ с сервиса
  answers$: Observable<Answer[] | string>;
  // асинхронные данные с формы
  searchWord$ = new Subject<string>();
  // асинхронные данные с колонны
  columnName$ = new Subject<string>();
  // массив имен заголовков
  columnNames: ColumnName[];
  // для вывода имени текущего заголовка
  currentColumnNameRu: string;

  constructor(public _dataService: DataService) {
    // инициализация заголовков
    this.columnNames = columnNames;
    // инициализация асинхронного ответа
    this.answers$ = this._dataService.getData(this.searchWord$, this.columnName$)

  }

  ngAfterViewInit() {
    // первый запрос; по умолчанию сортировака по 'title'
    this.columnClick('title');
  }

  isString(value) {
    return typeof value === 'string';
  }

  isArray(value) {
    return Array.isArray(value);
  }

  // клик по колонке
  columnClick(columnNameId) {
    // новый текущий заголовок
    this.columnName$.next(columnNameId);
    // очистка формы
    this.searchWord$.next('');
    this.input.nativeElement.value = '';
    // вывод текущего заголовка
    this.columnNames.forEach(item => {
      if (item.id === columnNameId) this.currentColumnNameRu = item.nameRu;
    });     
  }

}
