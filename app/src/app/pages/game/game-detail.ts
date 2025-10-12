import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { GameService } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { Game } from '../../interfaces/game.interface';
import { ThaiDatePipe } from '../../pipe/thai-date.pipe';
import { Static } from '../../components/layout/static/static';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../services/auth.service';
import { ImagePreview } from "../../components/image-preview/image-preview";

@Component({
  selector: 'app-game-detail',
  imports: [CommonModule, Button, ToastModule, ThaiDatePipe, Static, TagModule, RouterLink, ImagePreview],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.scss',
  providers: [MessageService],
})
export class GameDetail implements OnInit {
  gameId: string = '';
  game: Game | null = null;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private gameService: GameService,
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.params['id'];
    if (this.gameId) {
      this.loadGame();
    } else {
      this.router.navigate(['/']);
    }
  }

  loadGame(): void {
    this.isLoading = true;
    this.gameService.getGameById(this.gameId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.game = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading game:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลเกมได้',
        });
        this.router.navigate(['/']);
      },
    });
  }

  onNavigateBack(): void {
    this.router.navigate(['/']);
  }

  addToCart(): void {
    if (!this.game?.id) return;

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
  }

  buyNow(): void {
    if (!this.game?.id) return;

    // Add to cart first, then navigate to cart
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
}
