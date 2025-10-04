import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../navbar/admin/navbar';

@Component({
  selector: 'app-auth',
  imports: [RouterModule, Navbar],
  template: ` <app-navbar [authMode]="true"></app-navbar>
    <router-outlet></router-outlet>`,
})
export class Auth {
  constructor(router: Router) {
    if (router.url === '/auth') {
      router.navigate(['/auth/login']);
    }
  }
}
