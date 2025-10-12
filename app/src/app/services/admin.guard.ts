import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (this.userService.isAuthenticated && this.userService.isAdmin) {
      return true;
    } else if (this.userService.isAuthenticated) {
      this.router.navigate(['/']);
      return false;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
