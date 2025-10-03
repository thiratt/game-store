import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, SignupRequest } from '../../../services/auth.service';
import { MessageModule } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    Button,
    AvatarModule,
    DividerModule,
    ToastModule,
    MessageModule,
  ],
  providers: [MessageService],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  currentStep = 1;
  totalSteps = 2;
  isLoading = false;
  isCurrentStepValid = false;

  // Form data
  signupForm = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Form validation errors
  formErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  // Track if user has attempted to proceed (to show errors only after attempt)
  hasAttemptedNext = false;

  // Image upload properties
  uploadedImageUrl: string | null = null;
  uploadedImageFile: File | null = null;
  maxFileSize = 5 * 1024 * 1024; // 5MB limit
  allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async nextStep() {
    try {
      // Set flag to show errors
      this.hasAttemptedNext = true;

      const [isUsernameAvailable, isEmailAvailable] = await Promise.all([
        this.checkUsernameAvailability(),
        this.checkEmailAvailability(),
      ]);

      if (!isUsernameAvailable) {
        this.messageService.add({
          severity: 'error',
          summary: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว',
        });
        return;
      }

      if (!isEmailAvailable) {
        this.messageService.add({
          severity: 'error',
          summary: 'อีเมลนี้ถูกใช้งานแล้ว',
        });
        return;
      }

      if (this.validateCurrentStep(true)) {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          // Reset the flag for the next step
          this.hasAttemptedNext = false;
        }
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'เกิดข้อผิดพลาด',
        detail: 'ไม่สามารถไปขั้นตอนถัดไปได้ กรุณาลองอีกครั้ง',
      });
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Reset the flag when going back
      this.hasAttemptedNext = false;
      // Clear any error messages
      this.clearErrorMessages();
    }
  }

  clearErrorMessages() {
    this.formErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  // Image upload methods
  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleImageFile(file);
    }
  }

  handleImageFile(file: File) {
    // Validate file type
    if (!this.allowedFileTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'ไฟล์ไม่ถูกต้อง',
        detail: 'กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WebP)',
      });
      return;
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'ไฟล์ใหญ่เกินไป',
        detail: 'ขนาดไฟล์ต้องไม่เกิน 5MB',
      });
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageUrl = e.target?.result as string;
      this.uploadedImageFile = file;

      this.messageService.add({
        severity: 'success',
        summary: 'อัปโหลดสำเร็จ',
        detail: 'เลือกรูปภาพเรียบร้อยแล้ว',
      });
    };
    reader.readAsDataURL(file);
  }

  removeUploadedImage() {
    this.uploadedImageUrl = null;
    this.uploadedImageFile = null;
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    fileInput?.click();
  }

  // Validation methods (only show errors after user attempts to proceed)
  validateUsername(showErrors = false): boolean {
    const username = this.signupForm.username.trim();
    if (!username) {
      if (showErrors) this.formErrors.username = 'กรุณากรอกชื่อผู้ใช้งาน';
      return false;
    }
    if (username.length < 3) {
      if (showErrors) this.formErrors.username = 'ชื่อผู้ใช้งานต้องมีอย่างน้อย 3 ตัวอักษร';
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      if (showErrors)
        this.formErrors.username = 'ชื่อผู้ใช้งานสามารถใช้ได้เฉพาะตัวอักษร ตัวเลข และ _';
      return false;
    }
    this.formErrors.username = '';
    return true;
  }

  validateEmail(showErrors = false): boolean {
    const email = this.signupForm.email.trim();
    if (!email) {
      if (showErrors) this.formErrors.email = 'กรุณากรอกอีเมล';
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (showErrors) this.formErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
      return false;
    }
    this.formErrors.email = '';
    return true;
  }

  validatePassword(showErrors = false): boolean {
    const password = this.signupForm.password;
    if (!password) {
      if (showErrors) this.formErrors.password = 'กรุณากรอกรหัสผ่าน';
      return false;
    }
    if (password.length < 6) {
      if (showErrors) this.formErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return false;
    }
    this.formErrors.password = '';
    return true;
  }

  validateConfirmPassword(showErrors = false): boolean {
    if (!this.signupForm.confirmPassword) {
      if (showErrors) this.formErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
      return false;
    }
    if (this.signupForm.confirmPassword !== this.signupForm.password) {
      if (showErrors) this.formErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
      return false;
    }
    this.formErrors.confirmPassword = '';
    return true;
  }

  validateCurrentStep(showErrors = false): boolean {
    try {
      if (this.currentStep === 1) {
        const isUsernameValid = this.validateUsername(showErrors);
        const isEmailValid = this.validateEmail(showErrors);
        const isPasswordValid = this.validatePassword(showErrors);
        const isConfirmPasswordValid = this.validateConfirmPassword(showErrors);

        return isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid;
      }

      if (this.currentStep === 2) {
        const isAvatarSelected = !!this.uploadedImageUrl;

        if (!isAvatarSelected && showErrors) {
          this.messageService.add({
            severity: 'warn',
            summary: 'คำเตือน',
            detail: 'กรุณาเลือกอวตาร์หรืออัปโหลดรูปภาพ',
          });
        }

        return isAvatarSelected;
      }

      return true;
    } catch (error) {
      console.error('Error in validateCurrentStep:', error);
      return false;
    }
  }

  async submitSignup() {
    // Show errors if validation fails
    if (!this.validateCurrentStep(true) || this.isLoading) {
      console.log('Validation failed or already loading');
      return;
    }

    this.isLoading = true;

    try {
      // Prepare signup data
      const signupData: SignupRequest = {
        username: this.signupForm.username.trim(),
        email: this.signupForm.email.trim(),
        password: this.signupForm.password,
        profileImage: this.uploadedImageFile || undefined,
      };

      // Call API
      const response = await this.authService.signup(signupData).toPromise();

      if (response?.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ!',
          detail: 'สมัครสมาชิกเรียบร้อยแล้ว กำลังนำไปยังหน้าหลัก...',
        });

        // Redirect after successful signup
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } else {
        throw new Error(response?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'เกิดข้อผิดพลาด',
        detail: error.message || 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองอีกครั้ง',
      });
    } finally {
      this.isLoading = false;
    }
  }

  // Check email availability (optional - call on blur)
  async checkEmailAvailability(): Promise<boolean> {
    if (!this.validateEmail()) return false;

    try {
      const result = await firstValueFrom(
        this.authService.checkEmailAvailability(this.signupForm.email)
      );

      if (!result) return false;

      return result.available;
    } catch (error) {
      // Silently handle error - don't show to user for UX
      console.error('Error checking email availability:', error);
      return false;
    }
  }

  // Check username availability (optional - call on blur)
  async checkUsernameAvailability(): Promise<boolean> {
    if (!this.validateUsername()) return false;

    try {
      const result = await firstValueFrom(
        this.authService.checkUsernameAvailability(this.signupForm.username)
      );

      if (!result) return false;

      return result.available;
    } catch (error) {
      // Silently handle error - don't show to user for UX
      console.error('Error checking username availability:', error);

      return false;
    }
  }
}
