import { Component } from '@angular/core';
import { UserNavigationBar } from '../../components/navbar/user/user-navigation-bar';
import { Hero } from '../../components/landing/hero/hero';
import { TopSeller } from '../../components/landing/top-seller/top-seller';

@Component({
  selector: 'app-index',
  imports: [UserNavigationBar, Hero, TopSeller],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {}
