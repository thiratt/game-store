import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Button } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    Button,
    MessageModule,
    ToastModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [MessageService],
})
export class Login implements OnInit {
  loginData: LoginRequest = {
    identifier: '',
    password: '',
  };

  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Redirect to home if already authenticated
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
    }
  }

  onLogin() {
    if (!this.loginData.identifier || !this.loginData.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน',
      });
      return;
    }

    this.loading = true;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          if (response.data?.role.toLowerCase() === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'ข้อผิดพลาด',
            detail: response.message || 'เข้าสู่ระบบไม่สำเร็จ',
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'ข้อผิดพลาด',
          detail: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง',
        });
        console.error('Login error:', error);
      },
    });
  }
}
