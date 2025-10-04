import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/user/navbar';
import { Hero } from '../../components/landing/hero/hero';

@Component({
  selector: 'app-index',
  imports: [Navbar, Hero],
  templateUrl: './index.html',
  styleUrl: './index.scss',
})
export class Index {}
