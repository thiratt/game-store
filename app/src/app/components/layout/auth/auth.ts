import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Navbar } from '../../navbar/navbar';

@Component({
  selector: 'app-auth',
  imports: [RouterModule, Navbar],
  template: ` <app-navbar [authMode]="true"></app-navbar>
    <router-outlet></router-outlet>`,
})
export class Auth {
  constructor(router: Router) {
    router.navigate(['/auth/login']);
  }
}
