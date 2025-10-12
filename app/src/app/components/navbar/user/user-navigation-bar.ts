import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { ConfirmationService, MessageService } from 'primeng/api';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
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
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Select, SelectChangeEvent } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription, Observable } from 'rxjs';

import { Game, GameCategoryOption } from '../../../interfaces/game.interface';
import { AuthService, User } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { ApiResponse, GameService } from '../../../services/game.service';

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
    Select,
    AutoCompleteModule,
    OverlayBadgeModule,
  ],
  templateUrl: './user-navigation-bar.html',
  styleUrl: './user-navigation-bar.scss',
  providers: [ConfirmationService, MessageService],
})
export class UserNavigationBar implements OnInit, OnDestroy {
  @Input() authMode: boolean = false;
  searchResults = signal<Game[]>([]);
  gameCategories: GameCategoryOption[] = [];
  selectedCategory: GameCategoryOption | undefined;
  searchQuery: string = '';
  isSearchFocused: boolean = false;
  currentUser: User | null = null;
  cartCount$: Observable<number>;
  private authSubscription: Subscription = new Subscription();
  private routerSubscription: Subscription = new Subscription();

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
      label: 'เกมของฉัน',
      icon: 'pi pi-book',
      command: () => this.router.navigate(['/my-games']),
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
    private gameService: GameService,
    private cartService: CartService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.loadCategories();
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  loadCategories(): void {
    this.gameService.getCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.gameCategories = [
            { id: 0, name: 'ทั้งหมด', value: 'all' },
            ...response.data.map((category) => ({
              id: category.id,
              name: category.name,
              value: category.id,
            })),
          ];
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดประเภทเกมได้',
        });
      },
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    this.setDisableBodyScrolling(true);
  }

  onSearchBlur() {
    console.log('🔍 onSearchBlur called');
    this.isSearchFocused = false;
    this.setDisableBodyScrolling(false);
    this.cdr.detectChanges();
  }

  onSelectSearchResult(event: AutoCompleteSelectEvent) {
    const game: Game = event.value;
    window.location.href = '/game/' + game.id;
  }

  onSelectCategoryChange(event: SelectChangeEvent) {
    const query = this.searchQuery;
    const category = this.selectedCategory?.id || 0;
    if (query && query.trim()) {
      this.gameService.searchGames(query.trim(), category).subscribe({
        next: (response: ApiResponse<Game[]>) => {
          if (response.success && response.data) {
            this.searchResults.set(response.data);
          } else {
            this.searchResults.set([]);
          }
        },
      });
    } else {
      this.searchResults.set([]);
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

  searchGames(event: AutoCompleteCompleteEvent) {
    const query = event.query;
    const category = this.selectedCategory?.id || 0;
    if (query && query.trim()) {
      this.gameService.searchGames(query.trim(), category).subscribe({
        next: (response: ApiResponse<Game[]>) => {
          if (response.success && response.data) {
            this.searchResults.set(response.data);
          } else {
            this.searchResults.set([]);
          }
        },
      });
    } else {
      this.searchResults.set([]);
    }
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
