import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated && this.authService.isAdmin) {
      return true;
    } else if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
      return false;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
