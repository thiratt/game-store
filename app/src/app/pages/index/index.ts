import { Component } from '@angular/core';
import { UserNavigationBar } from '../../components/navbar/user/user-navigation-bar';
import { Hero } from '../../components/landing/hero/hero';

@Component({
  selector: 'app-index',
  imports: [UserNavigationBar, Hero],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {}
