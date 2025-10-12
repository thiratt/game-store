import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

import { AuthService, User } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';

interface NavItem {
  label: string;
  route: string;
  triggerPath?: string[];
}

@Component({
  selector: 'app-admin-navigation-bar',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    MenubarModule,
    AvatarModule,
    BadgeModule,
    FloatLabelModule,
    MenuModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './admin-navigation-bar.html',
  styleUrl: './admin-navigation-bar.scss',
  providers: [ConfirmationService, MessageService],
})
export class AdminNavigationBar implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private authSubscription: Subscription = new Subscription();

  navigationItems: NavItem[] = [
    { label: 'เกม', route: '/dashboard', triggerPath: ['game'] },
    { label: 'ธุรกรรม', route: '/dashboard/transaction' },
    { label: 'คูปอง', route: '/dashboard/coupons' },
  ];

  userMenuItems = [
    {
      label: 'โปรไฟล์',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/dashboard/profile']),
    },
    {
      label: 'ออกจากระบบ',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.authSubscription = this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  isActiveRoute(route: string, triggerPath?: string[]): boolean {
    if (triggerPath && triggerPath.length > 0) {
      return (
        this.router.url === route || triggerPath.some((path) => this.router.url.includes(path))
      );
    }

    return this.router.url === route;
  }

  onLogout() {
    this.confirmationService.confirm({
      message: 'คุณแน่ใจหรือว่าต้องการออกจากระบบ?',
      header: 'ออกจากระบบ',
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'ยกเลิก',
        outlined: true,
        size: 'small',
      },
      acceptButtonProps: {
        label: 'ตกลง',
        size: 'small',
      },
      accept: () => {
        this.logout();
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'ออกจากระบบเรียบร้อยแล้ว',
        });
      },
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  get isAuthenticated(): boolean {
    return this.userService.isAuthenticated;
  }

  get endpoint(): string {
    return this.userService.endpoint;
  }
}
