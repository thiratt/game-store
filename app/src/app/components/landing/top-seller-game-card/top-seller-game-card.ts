import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription, Observable, map } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { TopSellerGame } from '../../../interfaces/game.interface';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { GameService } from '../../../services/game.service';
import { CartService, CartItem } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-top-seller-game-card',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    BadgeModule,
    ThaiDatePipe,
    DecimalPipe,
    RouterLink,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <p-card class="rounded-2xl overflow-hidden relative">
      <!-- Rank Badge -->
      <div class="absolute top-2 left-2 z-10">
        <p-badge
          [value]="'#' + game.rank"
          [severity]="getRankSeverity(game.rank)"
          class="text-sm font-bold"
        ></p-badge>
      </div>

      <!-- Sales Count Badge -->
      <div class="absolute top-2 right-2 z-10">
        <p-badge [value]="game.salesCount + ' ขาย'" severity="info" class="text-xs"></p-badge>
      </div>

      <ng-template #header>
        <div class="relative overflow-hidden">
          <img
            alt="{{ game.title }}"
            class="aspect-video w-full h-56 object-cover cursor-pointer hover:scale-103 transition-transform"
            [src]="endpoint + game.imageUrl"
            (error)="$event.target.src = '/1401549.jpg'"
            [routerLink]="['/game', game.id]"
          />
        </div>
      </ng-template>

      <ng-template #title>
        <a
          class="cursor-pointer underline-offset-8 hover:underline hover:underline-offset-4 transition-all"
          [routerLink]="['/game', game.id]"
        >
          {{ game.title }}
        </a>
      </ng-template>

      <ng-template #subtitle>
        <div class="flex flex-col">
          @if (isOwned) {
          <p class="text-green-600 font-semibold">คุณมีเกมนี้แล้ว</p>
          @if (game.ownedAt) {
          <p>ซื้อเมื่อ {{ game.ownedAt | thaiDate : 'datetime' }}</p>
          } } @else {
          <p>ราคา {{ game.price | number : '1.0-0' }} บาท</p>
          <p>วางขายเมื่อวันที่ {{ game.releaseDate | thaiDate : 'datetime' }}</p>
          }
        </div>
      </ng-template>

      <ng-template #footer>
        <div class="flex gap-2 mt-3">
          @if (isOwned) {
          <p-button
            label="รายละเอียด"
            class="flex-1"
            styleClass="w-full"
            (click)="showDetails()"
            severity="secondary"
          />
          } @else {
          <p-button label="ซื้อเลย" class="flex-1" styleClass="w-full" (click)="buyNow()" />
          <p-button
            [icon]="(isInCart$ | async) ? 'pi pi-check' : 'pi pi-shopping-cart'"
            [variant]="(isInCart$ | async) ? 'text' : 'outlined'"
            [severity]="(isInCart$ | async) ? 'success' : undefined"
            [pTooltip]="(isInCart$ | async) ? 'อยู่ในตะกร้าแล้ว' : 'เพิ่มลงตะกร้า'"
            (click)="addToCart()"
            [disabled]="isInCart$ | async"
          />
          }
        </div>
      </ng-template>
    </p-card>

    <p-toast />
  `,
  styles: [
    `
      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class TopSellerGameCard implements OnInit, OnDestroy {
  @Input() game!: TopSellerGame;

  isInCart$: Observable<boolean> = new Observable<boolean>();
  private subscriptions: Subscription = new Subscription();

  constructor(
    public gameService: GameService,
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  get isOwned(): boolean {
    return !!this.game.ownedAt;
  }

  ngOnInit(): void {
    this.isInCart$ = this.cartService.getCartItems().pipe(
      map((response) => {
        if (response.success && response.data) {
          return response.data.some((item: CartItem) => item.gameId === this.game.id);
        }
        return false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  navigateToGame(): void {
    this.router.navigate(['/game', this.game.id]);
  }

  showDetails(): void {
    this.navigateToGame();
  }

  buyNow(): void {
    if (!this.authService.isAuthenticated) {
      this.messageService.add({
        severity: 'warn',
        summary: 'กรุณาเข้าสู่ระบบ',
        detail: 'คุณต้องเข้าสู่ระบบก่อนซื้อเกม',
      });
      return;
    }

    this.subscriptions.add(
      this.cartService.addToCart(this.game.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/cart']);
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถเพิ่มเกมลงตะกร้าได้',
          });
        },
      })
    );
  }

  addToCart(): void {
    if (!this.authService.isAuthenticated) {
      this.messageService.add({
        severity: 'warn',
        summary: 'กรุณาเข้าสู่ระบบ',
        detail: 'คุณต้องเข้าสู่ระบบก่อนเพิ่มลงตะกร้า',
      });
      return;
    }

    this.subscriptions.add(
      this.cartService.addToCart(this.game.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'เพิ่มลงตะกร้าแล้ว',
              detail: `เพิ่ม "${this.game.title}" ลงในตะกร้าเรียบร้อยแล้ว`,
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถเพิ่มเกมลงตะกร้าได้',
          });
        },
      })
    );
  }

  onImageError(event: any): void {
    event.target.src = '/1401549.jpg';
  }

  getRankSeverity(rank: number): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    switch (rank) {
      case 1:
        return 'warn'; // Gold
      case 2:
        return 'secondary'; // Silver
      case 3:
        return 'contrast'; // Bronze
      default:
        return 'info'; // Others
    }
  }
}
