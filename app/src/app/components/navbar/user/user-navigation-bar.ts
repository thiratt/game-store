import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
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
import { Select } from 'primeng/select';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { ApiResponse, GameService } from '../../../services/game.service';
import { Game } from '../../../interfaces/game.interface';

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
  ],
  templateUrl: './user-navigation-bar.html',
  styleUrl: './user-navigation-bar.scss',
  providers: [ConfirmationService, MessageService],
})
export class UserNavigationBar implements OnInit, OnDestroy {
  @Input() authMode: boolean = false;
  searchResults = signal<Game[]>([]);
  searchQuery: string = '';
  isMobileMenuOpen: boolean = false;
  isSearchFocused: boolean = false;
  currentUser: User | null = null;
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
      label: 'ออกจากระบบ',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout(),
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private gameService: GameService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
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
    if (query && query.trim()) {
      this.gameService.searchGames(query.trim()).subscribe({
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
