import { Component, ElementRef, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
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
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
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
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  @Input() authMode: boolean = false;
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
      command: () => this.logout(),
    },
  ];

  constructor(private router: Router, private authService: AuthService) {}

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

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  private setDisableBodyScrolling(disable: boolean) {
    const body = document.body;
    if (body) {
      body.style.overflow = disable ? 'hidden' : '';
    }
  }
}
