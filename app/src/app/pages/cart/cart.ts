import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService, ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputText } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

import { Static } from '../../components/layout/static/static';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { CartService, CartItem } from '../../services/cart.service';
import { PurchaseService } from '../../services/purchase.service';

@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    FormsModule,
    Static,
    Card,
    Button,
    InputText,
    TagModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    ThaiDatePipe,
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
  providers: [MessageService, ConfirmationService],
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoading: boolean = false;
  cartTotal: number = 0;
  discountCode: string = '';
  discountAmount: number = 0;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private purchaseService: PurchaseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  get endpoint(): string {
    return this.cartService.endpoint;
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price, 0);
  }

  get finalTotal(): number {
    return this.subtotal - this.discountAmount;
  }

  ngOnInit(): void {
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCartItems(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.cartService.getCartItems().subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.cartItems = response.data;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading cart items:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดตะกร้าสินค้าได้',
          });
        },
      })
    );
  }

  removeFromCart(cartItem: CartItem): void {
    this.confirmationService.confirm({
      message: `คุณต้องการลบ "${cartItem.title}" ออกจากตะกร้าสินค้าหรือไม่?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'ยกเลิก',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'ลบ',
        severity: 'danger',
        size: 'small',
      },
      accept: () => {
        this.subscriptions.add(
          this.cartService.removeFromCart(cartItem.id).subscribe({
            next: (response) => {
              if (response.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'สำเร็จ',
                  detail: response.message || 'ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว',
                });
                this.loadCartItems();
              }
            },
            error: (error) => {
              console.error('Error removing item from cart:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'เกิดข้อผิดพลาด',
                detail: 'ไม่สามารถลบสินค้าออกจากตะกร้าได้',
              });
            },
          })
        );
      },
    });
  }

  applyDiscountCode(): void {
    if (!this.discountCode.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'แจ้งเตือน',
        detail: 'กรุณากรอกโค้ดส่วนลด',
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'แจ้งเตือน',
      detail: 'ฟีเจอร์โค้ดส่วนลดจะเปิดใช้งานเร็วๆ นี้',
    });
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'แจ้งเตือน',
        detail: 'ตะกร้าสินค้าของคุณว่างเปล่า',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `คุณต้องการซื้อเกม ${
        this.cartItems.length
      } รายการ รวมเป็นเงิน ${this.finalTotal.toLocaleString()} บาท หรือไม่?`,
      header: 'ยืนยันการซื้อ',
      icon: 'pi pi-shopping-cart',
      rejectButtonProps: {
        label: 'ยกเลิก',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'ซื้อเลย',
        severity: 'success',
        size: 'small',
      },
      accept: () => {
        this.buyGames();
      },
    });
  }

  buyGames(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.purchaseService.checkoutCart().subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'สำเร็จ',
              detail: response.message || 'ซื้อเกมเรียบร้อยแล้ว',
            });
            this.router.navigate(['/my-games']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error purchasing games:', error);
          const errorMessage = error.error?.message || 'ไม่สามารถซื้อเกมได้';
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: errorMessage,
          });
        },
      })
    );
  }

  navigateToGame(gameId: string): void {
    this.router.navigate(['/game', gameId]);
  }

  continueShopping(): void {
    this.router.navigate(['/'], { replaceUrl: true });
  }
}
