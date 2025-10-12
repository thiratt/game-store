import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-admin-profile',
  imports: [CardModule, ButtonModule, TableModule, DatePipe, RouterLink],
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
  constructor(private readonly userService: UserService) {}

  get currentUser() {
    return this.userService.currentUser;
  }

  get endpoint(): string {
    return this.userService.endpoint;
  }
}
