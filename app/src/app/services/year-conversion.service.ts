import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class YearConversionService {
  toBuddhistEra(westernYear: number | Date): number {
    if (westernYear instanceof Date) {
      return westernYear.getFullYear() + 543;
    }
    return westernYear + 543;
  }

  toWesternYear(buddhistYear: number): number {
    return buddhistYear - 543;
  }

  getCurrentBuddhistYear(): number {
    return new Date().getFullYear() + 543;
  }

  formatDateWithBuddhistEra(date: Date, format: 'short' | 'long' = 'short'): string {
    const buddhistYear = this.toBuddhistEra(date);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (format === 'long') {
      const months = [
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
      return `${day} ${months[date.getMonth()]} ${buddhistYear}`;
    }

    return `${day}/${month.toString().padStart(2, '0')}/${buddhistYear}`;
  }
}
