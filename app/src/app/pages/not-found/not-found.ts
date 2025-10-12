import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';

import { AdminNavigationBar } from '../../components/navbar/admin/admin-navigation-bar';
import { UserNavigationBar } from '../../components/navbar/user/user-navigation-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [AdminNavigationBar, UserNavigationBar, ButtonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  constructor(private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }
}
