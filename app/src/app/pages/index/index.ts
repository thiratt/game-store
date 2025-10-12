import { Component } from '@angular/core';

import { Games } from '../../components/landing/games/games';
import { Hero } from '../../components/landing/hero/hero';
import { TopSeller } from '../../components/landing/top-seller/top-seller';
import { UserNavigationBar } from '../../components/navbar/user/user-navigation-bar';

@Component({
  selector: 'app-index',
  imports: [UserNavigationBar, Hero, TopSeller, Games],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {}
