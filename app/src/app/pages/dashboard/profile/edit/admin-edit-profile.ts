import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { AuthService } from '../../../../services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-edit-profile',
  imports: [
    ButtonModule,
    CardModule,
    FloatLabelModule,
    MessageModule,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './admin-edit-profile.html',
  styleUrl: './admin-edit-profile.scss',
})
export class AdminEditProfile implements OnInit, OnDestroy {
  formData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null as File | null,
  };

  usernameAvailable: boolean | null = null;
  emailAvailable: boolean | null = null;
  previewImageUrl: string | null = null;

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly usernameMinLength = 3;
  private readonly passwordMinLength = 6;

  private usernameCheck$ = new Subject<string>();
  private emailCheck$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly location: Location,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.setupUsernameCheck();
    this.setupEmailCheck();
  }

  ngOnInit(): void {
    if (this.currentUser) {
      this.formData.username = '';
      this.formData.email = '';
      this.usernameAvailable = true;
      this.emailAvailable = true;
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up preview URL to prevent memory leaks
    if (this.previewImageUrl) {
      URL.revokeObjectURL(this.previewImageUrl);
    }
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get endpoint(): string {
    return this.authService.endpoint;
  }

  get usernameLengthError(): string | null {
    if (this.formData.username && this.formData.username.length < this.usernameMinLength) {
      return `ชื่อผู้ใช้ต้องมีอย่างน้อย ${this.usernameMinLength} ตัวอักษร`;
    }
    return null;
  }

  get emailFormatError(): string | null {
    if (this.formData.email && !this.emailRegex.test(this.formData.email)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    return null;
  }

  get passwordLengthError(): string | null {
    const { password, confirmPassword } = this.formData;

    if (!password && !confirmPassword) return null;
    if (password && password.length < this.passwordMinLength) {
      return `รหัสผ่านต้องมีอย่างน้อย ${this.passwordMinLength} ตัวอักษร`;
    }

    return null;
  }

  get confirmPasswordMismatchError(): string | null {
    const { password, confirmPassword } = this.formData;

    if (!password && !confirmPassword) return null;
    if (confirmPassword && !password) {
      return 'กรุณากรอกรหัสผ่านใหม่';
    }
    if (
      password.length >= this.passwordMinLength &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      return 'รหัสผ่านไม่ตรงกัน';
    }

    return null;
  }

  onUsernameChange(value: string): void {
    if (value === this.currentUser?.username) {
      this.usernameAvailable = true;
      this.cdr.markForCheck();
      return;
    }
    this.usernameCheck$.next(value);
  }

  onEmailChange(value: string): void {
    if (value === this.currentUser?.email) {
      this.emailAvailable = true;
      this.cdr.markForCheck();
      return;
    }
    this.emailCheck$.next(value);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.formData.profileImage = input.files[0];

      // Create preview URL for the selected image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  resetImageSelection(): void {
    this.formData.profileImage = null;
    if (this.previewImageUrl) {
      URL.revokeObjectURL(this.previewImageUrl);
      this.previewImageUrl = null;
    }
    this.cdr.markForCheck();
  }

  onSave(): void {
    if (!this.validateForm()) return;

    const updateRequest = {
      username: this.formData.username,
      email: this.formData.email,
      password: this.formData.password,
      profileImage: this.formData.profileImage || undefined,
    };

    this.authService.updateProfile(updateRequest).subscribe({
      next: (response) => {
        this.location.back();
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  private setupUsernameCheck(): void {
    this.usernameCheck$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((username) => {
          if (!username.trim() || username.length < this.usernameMinLength) {
            this.usernameAvailable = null;
            this.cdr.markForCheck();
            return of(null);
          }
          return this.authService.checkUsernameAvailability(username);
        })
      )
      .subscribe((result) => {
        if (result === null) return;
        this.usernameAvailable = result.available;
        this.cdr.markForCheck();
      });
  }

  private setupEmailCheck(): void {
    this.emailCheck$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((email) => {
          if (!email.trim() || !this.emailRegex.test(email)) {
            this.emailAvailable = null;
            this.cdr.markForCheck();
            return of(null);
          }
          return this.authService.checkEmailAvailability(email);
        })
      )
      .subscribe((result) => {
        if (result === null) return;
        this.emailAvailable = result.available;
        this.cdr.markForCheck();
      });
  }

  validateForm(): boolean {
    const { username, email, password, confirmPassword, profileImage } = this.formData;

    const isAnyFieldFilled =
      username.trim() !== '' ||
      email.trim() !== '' ||
      password.trim() !== '' ||
      confirmPassword.trim() !== '' ||
      profileImage !== null;

    const isUsernameValid =
      !username.trim() ||
      (username.length >= this.usernameMinLength && this.usernameAvailable === true);

    const isEmailValid =
      !email.trim() || (this.emailRegex.test(email) && this.emailAvailable === true);

    const result = isAnyFieldFilled && isUsernameValid && isEmailValid && this.isPasswordValid();

    return result;
  }

  private isPasswordValid(): boolean {
    const { password, confirmPassword } = this.formData;

    const isPasswordFilled = password.trim() !== '';
    const isConfirmFilled = confirmPassword.trim() !== '';

    if (!isPasswordFilled && !isConfirmFilled) return true;
    if (isPasswordFilled && isConfirmFilled) {
      const isLengthValid = password.length >= this.passwordMinLength;
      const isMatch = password === confirmPassword;
      return isLengthValid && isMatch;
    }

    return false;
  }
}
