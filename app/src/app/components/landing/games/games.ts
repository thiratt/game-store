import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { GameService } from '../../../services/game.service';
import { Game } from '../../../interfaces/game.interface';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-games',
  imports: [ButtonModule, CardModule, ToastModule, FormsModule, DecimalPipe, ThaiDatePipe],
  templateUrl: './games.html',
  styleUrl: './games.scss',
  providers: [MessageService],
})
export class Games implements OnInit {
  isLoading: boolean = false;
  selectedDate: Date | null = null;
  games: Game[] = [];

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

  goToPreviousDay() {
    // if (this.selectedDate) {
    //   const newDate = new Date(this.selectedDate);
    //   newDate.setDate(newDate.getDate() - 1);
    //   this.selectedDate = newDate;
    // }
  }

  goToNextDay() {
    // if (this.selectedDate) {
    //   const newDate = new Date(this.selectedDate);
    //   newDate.setDate(newDate.getDate() + 1);
    //   this.selectedDate = newDate;
    // }
  }
}
