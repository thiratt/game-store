import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { CouponService } from '../../../../services/coupon.service';
import { CouponResponse, UpdateCouponRequest } from '../../../../interfaces/coupon.interface';

@Component({
  selector: 'app-edit',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    ToastModule,
    CardModule,
    SkeletonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
  providers: [MessageService],
})
export class EditCoupon implements OnInit {
  couponForm: FormGroup;
  loading = false;
  loadingCoupon = true;
  couponId: string = '';
  coupon: CouponResponse | null = null;
  isRedirecting = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
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

  ngOnInit(): void {
    this.couponId = this.route.snapshot.params['id'];
    if (this.couponId) {
      this.loadCoupon();
    } else {
      this.onNavigateBack();
    }
  }

  loadCoupon(): void {
    this.loadingCoupon = true;
    this.couponService.getCoupon(this.couponId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.coupon = response.data;
          this.couponForm.patchValue({
            code: this.coupon.code,
            description: this.coupon.description || '',
            discountValue: this.coupon.discountValue,
            maxUsage: this.coupon.maxUsage,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่พบคูปองที่ต้องการแก้ไข',
          });
          this.onNavigateBack();
        }
        this.loadingCoupon = false;
      },
      error: (error) => {
        console.error('Error loading coupon:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลคูปองได้',
        });
        this.loadingCoupon = false;
        this.onNavigateBack();
      },
    });
  }

  onNavigateBack(): void {
    this.router.navigate(['dashboard', 'coupons'], { replaceUrl: true });
  }

  onSubmit(): void {
    if (this.couponForm.valid) {
      this.loading = true;
      const request: UpdateCouponRequest = this.couponForm.value;

      this.couponService.updateCoupon(this.couponId, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'สำเร็จ',
              detail: 'แก้ไขคูปองเรียบร้อยแล้ว',
            });
            this.isRedirecting = true;
            setTimeout(() => {
              this.onNavigateBack();
            }, 1500);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'เกิดข้อผิดพลาด',
              detail: response.message || 'ไม่สามารถแก้ไขคูปองได้',
            });
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating coupon:', error);
          let errorMessage = 'ไม่สามารถแก้ไขคูปองได้';

          if (error.status === 409) {
            errorMessage = 'รหัสคูปองนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น';
          } else if (error.status === 404) {
            errorMessage = 'ไม่พบคูปองที่ต้องการแก้ไข';
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
