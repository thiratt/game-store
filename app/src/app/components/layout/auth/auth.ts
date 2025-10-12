import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { UserNavigationBar } from '../../navbar/user/user-navigation-bar';

@Component({
  selector: 'app-auth',
  imports: [RouterModule, UserNavigationBar],
  template: ` <app-user-navigation-bar [authMode]="true"></app-user-navigation-bar>
    <router-outlet></router-outlet>`,
})
export class Auth {
  constructor(router: Router) {
    if (router.url === '/auth') {
      router.navigate(['/auth/login']);
    }
  }
}
