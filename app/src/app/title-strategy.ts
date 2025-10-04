import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class KiroTitleStrategy extends TitleStrategy {
  private readonly rootTitle: string;

  constructor(private readonly titleService: Title) {
    super();
    this.rootTitle = document.title;
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);

    if (pageTitle) {
      this.titleService.setTitle(`${this.rootTitle} - ${pageTitle}`);
    } else {
      this.titleService.setTitle(this.rootTitle);
    }
  }
}
