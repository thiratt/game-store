import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from "primeng/floatlabel";
import { Button } from "primeng/button";

@Component({
  selector: 'app-login',
  imports: [CardModule, InputTextModule, FloatLabelModule, Button],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

}
