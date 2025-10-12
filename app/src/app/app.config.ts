import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, TitleStrategy, withViewTransitions } from '@angular/router';

import { providePrimeNG } from 'primeng/config';

import Noir from '../themes/noir';
import { routes } from './app.routes';
import { KiroTitleStrategy } from './title-strategy';

const dayNamesThai = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const dayNamesThaiShort = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const monthNamesThai = [
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

const monthNamesThaiShort = [
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    providePrimeNG({
      theme: Noir,
      translation: {
        dateFormat: 'dd MM yy',
        monthNames: monthNamesThai,
        monthNamesShort: monthNamesThaiShort,
        dayNames: dayNamesThai,
        dayNamesShort: dayNamesThaiShort,
        dayNamesMin: dayNamesThaiShort,
      },
    }),
    {
      provide: TitleStrategy,
      useClass: KiroTitleStrategy,
    },
  ],
};
