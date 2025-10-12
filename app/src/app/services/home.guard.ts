import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class HomeGuard implements CanActivate {
  constructor(private readonly userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (this.userService.isAuthenticated && this.userService.isAdmin) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
