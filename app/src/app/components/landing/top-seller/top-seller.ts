import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { Toast } from 'primeng/toast';

import { ThaiYear } from '../../../directive/thai-year.directive';
import { Game } from '../../../interfaces/game.interface';
import { GameService } from '../../../services/game.service';
import { UserGameCard } from '../../user/game-card/game-card';

@Component({
  selector: 'app-top-seller',
  imports: [ButtonModule, DatePicker, ThaiYear, FormsModule, CardModule, Toast, UserGameCard],
  templateUrl: './top-seller.html',
  styleUrl: './top-seller.scss',
  providers: [MessageService],
})
export class TopSeller implements OnInit {
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

  onDateChange(date: Date | null) {
    this.selectedDate = date;
    if (date) {
      console.log('Selected date in Buddhist Era:', ThaiYear.formatDateToBuddhistEra(date));
    }
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
