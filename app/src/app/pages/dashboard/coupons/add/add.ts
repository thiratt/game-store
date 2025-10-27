import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { CouponService } from '../../../../services/coupon.service';
import { AddCouponRequest } from '../../../../interfaces/coupon.interface';

@Component({
  selector: 'app-add',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    CardModule,
    ReactiveFormsModule,
  ],
  templateUrl: './add.html',
  styleUrl: './add.scss',
  providers: [MessageService],
})
export class AddCoupon {
  couponForm: FormGroup;
  loading = false;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly couponService: CouponService,
    private readonly messageService: MessageService
  ) {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      description: [''],
      discountValue: [0, [Validators.required, Validators.min(1)]],
      maxUsage: [1, [Validators.required, Validators.min(1)]],
    });
  }

  onNavigateBack(): void {
    this.router.navigate(['dashboard', 'coupons'], { replaceUrl: true });
  }

  onSubmit(): void {
    if (this.couponForm.valid) {
      this.loading = true;
      const request: AddCouponRequest = this.couponForm.value;

      this.couponService.addCoupon(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'สำเร็จ',
              detail: 'เพิ่มคูปองเรียบร้อยแล้ว',
            });
            setTimeout(() => {
              this.onNavigateBack();
            }, 1500);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'เกิดข้อผิดพลาด',
              detail: response.message || 'ไม่สามารถเพิ่มคูปองได้',
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error adding coupon:', error);
          let errorMessage = 'ไม่สามารถเพิ่มคูปองได้';

          if (error.status === 409) {
            errorMessage = 'รหัสคูปองนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: errorMessage,
          });
          this.loading = false;
        },
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'ข้อมูลไม่ถูกต้อง',
        detail: 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง',
      });
    }
  }

  get formControls() {
    return this.couponForm.controls;
  }
}
