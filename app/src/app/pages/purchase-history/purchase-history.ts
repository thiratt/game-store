import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';

import { Static } from '../../components/layout/static/static';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { PurchaseService, Purchase } from '../../services/purchase.service';

@Component({
  selector: 'app-purchase-history',
  imports: [
    CommonModule,
    Static,
    Card,
    Button,
    ToastModule,
    TagModule,
    ThaiDatePipe,
  ],
  templateUrl: './purchase-history.html',
  styleUrl: './purchase-history.scss',
  providers: [MessageService],
})
export class PurchaseHistory implements OnInit {
  purchases: Purchase[] = [];
  isLoading: boolean = false;

  constructor(
    private purchaseService: PurchaseService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPurchaseHistory();
  }

  loadPurchaseHistory(): void {
    this.isLoading = true;
    this.purchaseService.getPurchaseHistory().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.purchases = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading purchase history:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดประวัติการซื้อได้',
        });
      },
    });
  }

  navigateToGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  goBack(): void {
    this.router.navigate(['/'], { replaceUrl: true });
  }
}