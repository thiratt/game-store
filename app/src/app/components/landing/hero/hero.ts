import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Game, GameService } from '../../../services/game.service';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, DecimalPipe, ButtonModule, TagModule, CardModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  featuredGame: Game | null = null;

  constructor(private gameService: GameService) {
    this.loadFeaturedGame();
  }

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  loadFeaturedGame() {
    this.gameService.getLatestReleaseGames().subscribe((response) => {
      if (response.success) {
        this.featuredGame = response.data!;
      }
    });
  }

  onBuyNow() {
    console.log('Buy now clicked');
    // Implement buy functionality
  }

  onAddToWishlist() {
    console.log('Add to wishlist clicked');
    // Implement wishlist functionality
  }
}
