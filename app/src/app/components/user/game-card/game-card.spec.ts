import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGameCard } from './game-card';

describe('GameCard', () => {
  let component: UserGameCard;
  let fixture: ComponentFixture<UserGameCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGameCard],
    }).compileComponents();

    fixture = TestBed.createComponent(UserGameCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
