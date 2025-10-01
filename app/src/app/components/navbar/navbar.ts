import { Component, ElementRef, ViewChild } from '@angular/core';
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
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isSearchFocused: boolean = false;
  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  navigationItems = [
    { label: 'หน้าหลัก', route: '/' },
    { label: 'หมวดหมู่', route: '/categories' },
  ];

  constructor(private router: Router) {}

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

  private setDisableBodyScrolling(disable: boolean) {
    const body = document.body;
    if (body) {
      body.style.overflow = disable ? 'hidden' : '';
    }
  }
}
