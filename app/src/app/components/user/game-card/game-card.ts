import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { Game } from '../../../interfaces/game.interface';
import { ThaiDatePipe } from '../../../pipe/thai-date.pipe';
import { GameService } from '../../../services/game.service';

@Component({
  selector: 'app-user-game-card',
  imports: [CardModule, ButtonModule, ThaiDatePipe, DecimalPipe, RouterLink],
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
        <p-button label="ซื้อเลย" class="flex-1" styleClass="w-full" />
        <p-button icon="pi pi-shopping-cart" variant="outlined" />
      </div>
    </ng-template>
  </p-card> `,
})
export class UserGameCard {
  @Input({ required: true }) game!: Game;

  constructor(private gameService: GameService) {}

  get endpoint(): string {
    return this.gameService.endpoint;
  }
}
