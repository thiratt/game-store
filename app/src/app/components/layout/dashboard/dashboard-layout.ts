import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminNavigationBar } from '../../navbar/admin/admin-navigation-bar';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, AdminNavigationBar],
  template: `
    <app-admin-navigation-bar></app-admin-navigation-bar>
    <router-outlet></router-outlet>
  `,
})
export class DashboardLayout {}
