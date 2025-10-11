import { Component } from '@angular/core';
import { UserNavigationBar } from '../../navbar/user/user-navigation-bar';

@Component({
  selector: 'app-static',
  imports: [UserNavigationBar],
  template: `
    <app-user-navigation-bar></app-user-navigation-bar>
    <main class="px-4 pt-[64px]">
      <ng-content></ng-content>
    </main>
  `,
})
export class Static {}
