import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(private readonly userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (!this.userService.isAuthenticated) {
      return true;
    } else {
      if (this.userService.isAdmin) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/profile']);
      }
      return false;
    }
  }
}
