import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { ThaiYear } from '../../../directive/thai-year.directive';
import { TopSellerGame } from '../../../interfaces/game.interface';
import { GameService } from '../../../services/game.service';
import { TopSellerGameCard } from '../top-seller-game-card/top-seller-game-card';
import { ThaiDatePipe } from "../../../pipe/thai-date.pipe";

@Component({
  selector: 'app-top-seller',
  imports: [
    ButtonModule,
    DatePicker,
    ThaiYear,
    FormsModule,
    CardModule,
    Toast,
    TooltipModule,
    TopSellerGameCard,
    ThaiDatePipe
],
  templateUrl: './top-seller.html',
  styleUrl: './top-seller.scss',
  providers: [MessageService],
})
export class TopSeller implements OnInit {
  isLoading: boolean = false;
  selectedDate: Date | null = null;
  games: TopSellerGame[] = [];
  today: Date = new Date();

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
    this.gameService.getTopSellers(this.selectedDate || new Date(), 10).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.games = response.data;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading top sellers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการเกมขายดีได้',
        });
      },
    });
  }

  onDateChange(date: Date | null) {
    this.selectedDate = date;
    if (date) {
      console.log('Selected date in Buddhist Era:', ThaiYear.formatDateToBuddhistEra(date));
      this.loadGames(); // Reload games when date changes
    }
  }

  goToPreviousDay() {
    if (this.selectedDate) {
      const newDate = new Date(this.selectedDate);
      newDate.setDate(newDate.getDate() - 1);
      this.selectedDate = newDate;
      this.loadGames();
    }
  }

  goToNextDay() {
    if (this.selectedDate) {
      const newDate = new Date(this.selectedDate);
      newDate.setDate(newDate.getDate() + 1);
      this.selectedDate = newDate;
      this.loadGames();
    }
  }
}
