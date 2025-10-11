import { Component, ElementRef, Input, ViewChild, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService, User } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from "primeng/select";

@Component({
  selector: 'app-user-navigation-bar',
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
    Select
],
  templateUrl: './user-navigation-bar.html',
  styleUrl: './user-navigation-bar.scss',
  providers: [ConfirmationService, MessageService],
})
export class UserNavigationBar implements OnInit, OnDestroy {
  @Input() authMode: boolean = false;
  @Input() position: 'static' | 'fixed' = 'fixed';
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isSearchFocused: boolean = false;
  currentUser: User | null = null;
  private authSubscription: Subscription = new Subscription();

  navigationItems = [
    { label: 'หน้าหลัก', route: '/' },
    { label: 'หมวดหมู่', route: '/categories' },
  ];

  userMenuItems = [
    {
      label: 'โปรไฟล์',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile']),
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
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  clearSearch() {
    console.log('Clear search clicked');
    this.searchQuery = '';
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    this.setDisableBodyScrolling(true);
  }

  onSearchBlur() {
    this.isSearchFocused = false;
    this.setDisableBodyScrolling(false);
  }

  onSearchInput() {
    if (this.searchQuery.trim()) {
      this.isSearchFocused = true;
      this.setDisableBodyScrolling(true);
    }
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
    return this.authService.isAuthenticated;
  }

  get endpoint(): string {
    return this.authService.endpoint;
  }

  private setDisableBodyScrolling(disable: boolean) {
    const body = document.body;
    if (body) {
      body.style.overflow = disable ? 'hidden' : '';
    }
  }
}
