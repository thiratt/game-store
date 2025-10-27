import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

import { Static } from '../../components/layout/static/static';
import { UserGameCard } from '../../components/user/game-card/game-card';
import { Game } from '../../interfaces/game.interface';
import { PurchaseService } from '../../services/purchase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-games',
  imports: [CommonModule, Static, Button, ToastModule, UserGameCard],
  templateUrl: './my-games.html',
  styleUrl: './my-games.scss',
  providers: [MessageService],
})
export class MyGames implements OnInit, OnDestroy {
  ownedGames: Game[] = [];
  isLoading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private purchaseService: PurchaseService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOwnedGames();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadOwnedGames(): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.purchaseService.getOwnedGames().subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.ownedGames = response.data.games;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading owned games:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดเกมของคุณได้',
          });
        },
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  goToPurchaseHistory(): void {
    this.router.navigate(['/purchase-history']);
  }

  goToGameStore(): void {
    this.router.navigate(['/']);
  }

  trackByGameId(index: number, game: Game): string {
    return game.id;
  }
}
