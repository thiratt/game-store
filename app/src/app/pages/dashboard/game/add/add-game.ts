import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';

interface GameCatergory {
  name: string;
  code: string;
}

interface GameForm {
  name: string;
  price: number;
  catergories: GameCatergory[];
  description: string;
  coverImage: string;
}

@Component({
  selector: 'app-add-game',
  imports: [Button, InputText, InputNumberModule, TextareaModule, FormsModule, MultiSelectModule],
  templateUrl: './add-game.html',
  styleUrl: './add-game.scss',
})
export class AddGame {
  isDragOver: boolean = false;
  catergories: GameCatergory[] = [
    {
      name: 'ปริศนา',
      code: 'puzzle',
    },
    {
      name: 'สยอง',
      code: 'horror',
    },
  ];

  game: GameForm = {
    name: '',
    price: 0,
    catergories: [],
    description: '',
    coverImage: '',
  };
  constructor(private router: Router) {}
  onNavigateBack(): void {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}
