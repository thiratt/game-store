import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiDate',
})
export class ThaiDatePipe implements PipeTransform {
  private thaiMonthsFull = [
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

  private thaiMonthsShort = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];

  transform(value: string | Date, format: 'long' | 'short' | 'datetime' = 'long'): string {
    if (!value) return '';

    const utcDate = new Date(value);
    const date = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);

    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear() + 543;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    switch (format) {
      case 'short':
        return `${day} ${this.thaiMonthsShort[monthIndex]} ${String(year).slice(2)}`;
      case 'datetime':
        return `${day} ${this.thaiMonthsFull[monthIndex]} พ.ศ. ${year} เวลา ${hours}:${minutes} น.`;
      case 'long':
      default:
        return `${day} ${this.thaiMonthsFull[monthIndex]} พ.ศ. ${year}`;
    }
  }
}
