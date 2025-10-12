import { DecimalPipe, CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription, Observable, map } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { Game } from '../../../interfaces/game.interface';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { GameService } from '../../../services/game.service';
import { CartService, CartItem } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-game-card',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TooltipModule,
    ThaiDatePipe,
    DecimalPipe,
    RouterLink,
    ToastModule,
  ],
  template: `<p-card class="rounded-2xl overflow-hidden">
      <ng-template #header>
        <div class="relative overflow-hidden">
          <img
            alt="{{ game.title }}"
            class="w-full h-56 object-cover cursor-pointer hover:scale-103 transition-transform"
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
          <p>ราคา {{ game.price | number : '1.0-0' }} บาท</p>
          <p>วางขายเมื่อวันที่ {{ game.releaseDate | thaiDate : 'datetime' }}</p>
        </div>
      </ng-template>
      <ng-template #footer>
        <div class="flex gap-2 mt-3">
          <p-button label="ซื้อเลย" class="flex-1" styleClass="w-full" (click)="buyNow()" />
          <p-button
            [icon]="(isInCart$ | async) ? 'pi pi-check' : 'pi pi-shopping-cart'"
            [variant]="(isInCart$ | async) ? 'text' : 'outlined'"
            [severity]="(isInCart$ | async) ? 'success' : undefined"
            [pTooltip]="(isInCart$ | async) ? 'อยู่ในตะกร้าแล้ว' : 'เพิ่มลงตะกร้า'"
            (click)="addToCart()"
            [disabled]="isInCart$ | async"
          />
        </div>
      </ng-template>
    </p-card>
    <p-toast /> `,
  providers: [MessageService],
})
export class UserGameCard implements OnInit, OnDestroy {
  @Input({ required: true }) game!: Game;

  isInCart$: Observable<boolean> = new Observable<boolean>();
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private gameService: GameService,
    private cartService: CartService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isInCart$ = this.cartService.cartItems$.pipe(
      map((cartItems: CartItem[]) =>
        cartItems.some((item: CartItem) => item.gameId === this.game.id)
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  addToCart(): void {
    if (!this.game?.id) return;

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.subscriptions.add(
      this.isInCart$.subscribe((isInCart) => {
        if (isInCart) {
          return;
        }

        this.cartService.addToCart(this.game.id).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'สำเร็จ',
                detail: response.message || 'เพิ่มลงตะกร้าสินค้าเรียบร้อยแล้ว',
              });
            }
          },
          error: (error) => {
            console.error('Error adding to cart:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'เกิดข้อผิดพลาด',
              detail: 'ไม่สามารถเพิ่มสินค้าลงตะกร้าได้',
            });
          },
        });
      })
    );
  }

  buyNow(): void {
    if (!this.game?.id) return;

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.subscriptions.add(
      this.isInCart$.subscribe((isInCart) => {
        if (isInCart) {
          this.router.navigate(['/cart']);
        } else {
          this.cartService.addToCart(this.game.id).subscribe({
            next: (response) => {
              if (response.success) {
                this.router.navigate(['/cart']);
              }
            },
            error: (error) => {
              console.error('Error adding to cart for buy now:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'เกิดข้อผิดพลาด',
                detail: 'ไม่สามารถดำเนินการซื้อได้',
              });
            },
          });
        }
      })
    );
  }
}
