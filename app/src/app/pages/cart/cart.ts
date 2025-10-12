import { Component } from '@angular/core';
import { Static } from "../../components/layout/static/static";
import { Card } from "primeng/card";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { TagModule } from "primeng/tag";

@Component({
  selector: 'app-cart',
  imports: [Static, Card, Button, InputText, TagModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart {

}
