import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { CouponService } from '../../../services/coupon.service';
import { CouponResponse } from '../../../interfaces/coupon.interface';

@Component({
  selector: 'app-coupons',
  imports: [
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TooltipModule,
    ToastModule,
    FormsModule,
    ThaiDatePipe,
  ],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss',
  providers: [MessageService],
})
export class Coupons implements OnInit {
  coupons: CouponResponse[] = [];
  loading = false;

  constructor(
    private readonly couponService: CouponService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(showSuccessMessage = false): void {
    this.loading = true;
    this.couponService.getAllCoupons().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.coupons = response.data;
          if (showSuccessMessage) {
            this.messageService.add({
              severity: 'success',
              summary: 'สำเร็จ',
              detail: 'โหลดข้อมูลคูปองเรียบร้อยแล้ว',
            });
          }
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'คำเตือน',
            detail: response.message || 'ไม่พบข้อมูลคูปอง',
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading coupons:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลคูปองได้',
        });
        this.loading = false;
      },
    });
  }

  refreshCoupons(): void {
    this.loadCoupons(true);
  }
}
