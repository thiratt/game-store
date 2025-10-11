import { Directive, OnInit, ElementRef } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';

@Directive({
  selector: '[ThaiYear]',
})
export class ThaiYear implements OnInit {
  currentYear: number = new Date().getFullYear() + 543;

  constructor(private datePicker: DatePicker, private el: ElementRef) {
    if (!this.datePicker) {
      throw new Error('ThaiYear directive must be used on a p-datepicker component.');
    }
    const getYear = this.datePicker.getYear;
    const switchToYearView = this.datePicker.switchToYearView;

    this.datePicker.getYear = (month: any) => {
      return getYear.call(this.datePicker, month) + 543;
    };

    this.datePicker.switchToYearView = (event: any) => {
      switchToYearView.call(this.datePicker, event);
      const yearCells = this.el.nativeElement.querySelectorAll('.p-datepicker-year');
      yearCells.forEach((cell: any) => {
        const year = parseInt(cell.textContent, 10);
        cell.textContent = (year + 543).toString();
      });
    };
  }

  ngOnInit() {
    this.setupBuddhistEraDatePicker();
  }

  private setupBuddhistEraDatePicker() {
    if (!this.datePicker.placeholder) {
      const today = new Date();
      const buddhistYear = ThaiYear.convertToBuddhistEra(today.getFullYear());
      const thaiMonths = [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ];
      this.datePicker.placeholder = `${today.getDate()} ${
        thaiMonths[today.getMonth()]
      } ${buddhistYear}`;
    }

    this.datePicker.formatDate = (date: Date, format: string) => {
      if (date) {
        const buddhistYear = ThaiYear.convertToBuddhistEra(date.getFullYear());
        const thaiMonths = [
          'มกราคม',
          'กุมภาพันธ์',
          'มีนาคม',
          'เมษายน',
          'พฤษภาคม',
          'มิถุนายน',
          'กรกฎาคม',
          'สิงหาคม',
          'กันยายน',
          'ตุลาคม',
          'พฤศจิกายน',
          'ธันวาคม',
        ];
        return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${buddhistYear}`;
      }
      return '';
    };

    if (!this.datePicker.value) {
      this.datePicker.value = new Date();
    }
  }

  static convertToBuddhistEra(westernYear: number): number {
    return westernYear + 543;
  }

  static convertToWesternYear(buddhistYear: number): number {
    return buddhistYear - 543;
  }

  static getCurrentBuddhistYear(): number {
    return new Date().getFullYear() + 543;
  }

  static formatDateToBuddhistEra(date: Date): string {
    const buddhistYear = ThaiYear.convertToBuddhistEra(date.getFullYear());
    const thaiMonths = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];
    return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${buddhistYear}`;
  }
}
