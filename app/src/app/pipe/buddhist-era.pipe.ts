import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'buddhistEra',
  standalone: true,
})
export class BuddhistEraPipe implements PipeTransform {
  transform(value: number | Date | string): string {
    let year: number;

    if (value instanceof Date) {
      year = value.getFullYear();
    } else if (typeof value === 'string') {
      const date = new Date(value);
      year = date.getFullYear();
    } else if (typeof value === 'number') {
      year = value;
    } else {
      return '';
    }

    const buddhistYear = year + 543;
    return buddhistYear.toString();
  }
}
