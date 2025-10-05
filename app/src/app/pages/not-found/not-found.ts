import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AdminNavigationBar } from '../../components/navbar/admin/admin-navigation-bar';
import { UserNavigationBar } from '../../components/navbar/user/user-navigation-bar';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

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
