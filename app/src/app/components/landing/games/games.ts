import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

import { Game } from '../../../interfaces/game.interface';
import { GameService } from '../../../services/game.service';
import { UserGameCard } from '../../user/game-card/game-card';

@Component({
  selector: 'app-games',
  imports: [ButtonModule, CardModule, ToastModule, FormsModule, UserGameCard],
  templateUrl: './games.html',
  styleUrl: './games.scss',
  providers: [MessageService],
})
export class Games implements OnInit {
  @ViewChild('gameContainer', { static: false }) gameContainer!: ElementRef;

  isLoading: boolean = false;
  selectedDate: Date | null = null;
  games: Game[] = [];
  private scrollAmount = 400;

  constructor(private gameService: GameService, private messageService: MessageService) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }

  ngOnInit() {
    this.selectedDate = new Date();
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading = true;
    this.gameService.getGames().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.games = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading games:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการเกมได้',
        });
      },
    });
  }

  slideToLeft() {
    if (this.gameContainer?.nativeElement) {
      const container = this.gameContainer.nativeElement;
      const currentScroll = container.scrollLeft;
      const newScroll = Math.max(0, currentScroll - this.scrollAmount);

      container.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    }
  }

  slideToRight() {
    if (this.gameContainer?.nativeElement) {
      const container = this.gameContainer.nativeElement;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScroll = Math.min(maxScroll, currentScroll + this.scrollAmount);

      container.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    }
  }

  get canScrollLeft(): boolean {
    if (!this.gameContainer?.nativeElement) return false;
    return this.gameContainer.nativeElement.scrollLeft > 0;
  }

  get canScrollRight(): boolean {
    if (!this.gameContainer?.nativeElement) return false;
    const container = this.gameContainer.nativeElement;
    return container.scrollLeft < container.scrollWidth - container.clientWidth;
  }

  onScroll() {}
}
