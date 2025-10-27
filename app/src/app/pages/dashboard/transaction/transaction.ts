import { Component } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { UserService } from '../../../services/user.service';
import { UserTransactionDetail } from '../../../interfaces/user.interface';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';

@Component({
  selector: 'app-transaction',
  imports: [DecimalPipe, CardModule, ButtonModule, TableModule, ThaiDatePipe],
  templateUrl: './transaction.html',
  styleUrl: './transaction.scss',
})
export class Transaction {
  users: UserTransactionDetail[] = [];
  userSelection: UserTransactionDetail | null = null;

  constructor(private readonly userService: UserService) {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.userSelection = this.users[0];
    });
  }

  get endpoint(): string {
    return this.userService.endpoint;
  }
}
