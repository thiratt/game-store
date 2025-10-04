import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { UserNavigationBar } from '../../components/navbar/user/user-navigation-bar';
import { AuthService } from '../../services/auth.service';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { InputNumber } from 'primeng/inputnumber';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    UserNavigationBar,
    Card,
    ButtonModule,
    ToggleButtonModule,
    FormsModule,
    IconField,
    InputIcon,
    TableModule,
    InputNumber,
    RouterLink,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  isTopupVisible: boolean = false;
  selectedAmount: number | null = null;
  customAmount: number | null = null;

  transactionHistory = [
    {
      date: '2024-10-01',
      type: 'เติมเงิน',
      description: 'เติมเงินเข้ากระเป๋า',
      amount: 500,
    },
  ];

  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  toggleTopup(): void {
    this.isTopupVisible = !this.isTopupVisible;

    if (!this.isTopupVisible) {
      this.resetTopupForm();
    }
  }

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.customAmount = null;
  }

  onCustomAmountChange(value: number | null): void {
    this.customAmount = value;
    if (value) {
      this.selectedAmount = null;
    }
  }

  getTopupAmount(): number | null {
    if (this.selectedAmount) {
      return this.selectedAmount;
    }
    if (this.customAmount) {
      return this.customAmount;
    }
    return null;
  }

  isTopupValid(): boolean {
    const amount = this.getTopupAmount();
    return amount !== null && amount > 0;
  }

  processTopup(): void {
    const amount = this.getTopupAmount();

    if (!this.isTopupValid()) {
      console.warn('Invalid topup amount');
      return;
    }

    console.log(`Processing topup of ${amount} บาท`);

    this.resetTopupForm();

    this.isTopupVisible = false;
  }

  private resetTopupForm(): void {
    this.selectedAmount = null;
    this.customAmount = null;
  }
}
