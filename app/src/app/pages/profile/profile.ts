import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputNumber } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';

import { Static } from '../../components/layout/static/static';
import { AuthService } from '../../services/auth.service';
import { TopupService, TransactionHistory } from '../../services/topup.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    Card,
    ButtonModule,
    ToggleButtonModule,
    FormsModule,
    IconField,
    InputIcon,
    TableModule,
    InputNumber,
    RouterLink,
    Static,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class UserProfile implements OnInit, OnDestroy {
  isTopupVisible: boolean = false;
  selectedAmount: number | null = null;
  customAmount: number | null = null;
  isProcessing: boolean = false;
  transactionHistory: TransactionHistory[] = [];
  isLoadingHistory: boolean = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private topupService: TopupService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadTransactionHistory();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get currentUser() {
    return this.userService.currentUser;
  }

  get endpoint() {
    return this.userService.endpoint;
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

  loadTransactionHistory(): void {
    this.isLoadingHistory = true;
    this.subscriptions.add(
      this.topupService.getTransactionHistory().subscribe({
        next: (response) => {
          this.isLoadingHistory = false;
          if (response.success && response.data) {
            this.transactionHistory = response.data;
          }
        },
        error: (error) => {
          this.isLoadingHistory = false;
          console.error('Error loading transaction history:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดประวัติการทำรายการได้',
          });
        },
      })
    );
  }

  processTopup(): void {
    const amount = this.getTopupAmount();

    if (!this.isTopupValid() || !amount) {
      return;
    }

    this.confirmationService.confirm({
      message: `คุณต้องการเติมเงิน ${amount.toLocaleString()} บาท หรือไม่?`,
      header: 'ยืนยันการเติมเงิน',
      icon: 'pi pi-wallet',
      rejectButtonProps: {
        label: 'ยกเลิก',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'เติมเงิน',
        severity: 'success',
        size: 'small',
      },
      accept: () => {
        this.executeTopup(amount);
      },
    });
  }

  executeTopup(amount: number): void {
    this.isProcessing = true;

    this.subscriptions.add(
      this.topupService.processTopup({ amount }).subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'สำเร็จ',
              detail: response.message || 'เติมเงินเรียบร้อยแล้ว',
            });

            // Refresh wallet balance and transaction history
            this.refreshWalletBalance();
            this.loadTransactionHistory();

            // Reset form
            this.resetTopupForm();
            this.isTopupVisible = false;
          }
        },
        error: (error) => {
          this.isProcessing = false;
          console.error('Error processing topup:', error);
          const errorMessage = error.error?.message || 'ไม่สามารถเติมเงินได้';
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: errorMessage,
          });
        },
      })
    );
  }

  refreshWalletBalance(): void {
    this.subscriptions.add(
      this.topupService.getWalletBalance().subscribe({
        next: (response) => {
          if (response.success && response.data && this.currentUser) {
            // Update the current user's wallet balance
            this.currentUser.walletBalance = response.data.balance;
          }
        },
        error: (error) => {
          console.error('Error refreshing wallet balance:', error);
        },
      })
    );
  }

  private resetTopupForm(): void {
    this.selectedAmount = null;
    this.customAmount = null;
  }
}
