import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminNavigationBar } from '../../../components/navbar/admin/admin-navigation-bar';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-profile',
  imports: [AdminNavigationBar, CardModule, ButtonModule, TableModule, DatePipe],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.scss',
})
export class AdminProfile {
  history = [
    {
      date: '2024-10-01',
      type: 'เพิ่มเกม',
      description: 'เพิ่มเกม Pubg ในระบบ',
    },
  ];
  constructor(private readonly authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }
}
