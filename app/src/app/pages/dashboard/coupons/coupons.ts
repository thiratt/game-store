import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { CouponService } from '../../../services/coupon.service';
import { CouponResponse } from '../../../interfaces/coupon.interface';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-coupons',
  imports: [
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    ThaiDatePipe,
    RouterLink
],
  templateUrl: './coupons.html',
  styleUrl: './coupons.scss',
  providers: [MessageService, ConfirmationService],
})
export class Coupons implements OnInit {
  coupons: CouponResponse[] = [];
  loading = false;

  constructor(
    private readonly couponService: CouponService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
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

  confirmDelete(coupon: CouponResponse): void {
    this.confirmationService.confirm({
      message: `คุณแน่ใจหรือไม่ที่จะลบคูปอง "${coupon.code}"?`,
      header: 'ยืนยันการลบ',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteCoupon(coupon);
      },
    });
  }

  private deleteCoupon(coupon: CouponResponse): void {
    this.couponService.deleteCoupon(coupon.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'ลบคูปองเรียบร้อยแล้ว',
          });
          // Remove the deleted coupon from the local array
          this.coupons = this.coupons.filter((c) => c.id !== coupon.id);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: response.message || 'ไม่สามารถลบคูปองได้',
          });
        }
      },
      error: (error) => {
        console.error('Error deleting coupon:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบคูปองได้',
        });
      },
    });
  }
}
