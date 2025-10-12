import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { Game } from '../../../interfaces/game.interface';
import { GameService } from '../../../services/game.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { map, Observable } from 'rxjs';
import { CartItem, CartService } from '../../../services/cart.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, DecimalPipe, ButtonModule, TagModule, CardModule, Toast],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  providers: [MessageService],
})
export class Hero implements OnInit {
  featuredGame: Game | null = null;

  isInCart$: Observable<boolean> = new Observable<boolean>();
  private subscriptions = new Subscription();

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private cartService: CartService,
    private gameService: GameService,
    private messageService: MessageService
  ) {
    this.loadFeaturedGame();
  }

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  ngOnInit(): void {
    this.isInCart$ = this.cartService.cartItems$.pipe(
      map((cartItems: CartItem[]) =>
        cartItems.some((item: CartItem) => item.gameId === this.featuredGame?.id)
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadFeaturedGame() {
    this.gameService.getLatestReleaseGames().subscribe((response) => {
      if (response.success) {
        this.featuredGame = response.data!;
      }
    });
  }

  onBuyNow() {
    if (!this.featuredGame?.id) return;

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.subscriptions.add(
      this.isInCart$.subscribe((isInCart) => {
        console.log(isInCart);

        if (isInCart) {
          this.router.navigate(['/cart']);
        } else {
          this.cartService.addToCart(this.featuredGame!.id).subscribe({
            next: (response) => {
              if (response.success) {
                this.router.navigate(['/cart']);
              }
            },
            error: (error) => {
              console.error('Error adding to cart for buy now:', error);
              // this.messageService.add({
              //   severity: 'error',
              //   summary: 'เกิดข้อผิดพลาด',
              //   detail: 'ไม่สามารถดำเนินการซื้อได้',
              // });
            },
          });
        }
      })
    );
  }

  onAddToWishlist() {
    if (!this.featuredGame?.id) return;

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.subscriptions.add(
      this.isInCart$.subscribe((isInCart) => {
        if (isInCart) {
          return;
        }

        this.cartService.addToCart(this.featuredGame!.id).subscribe({
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
}
