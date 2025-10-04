import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNavigationBar } from './user-navigation-bar';

describe('UserNavigationBar', () => {
  let component: UserNavigationBar;
  let fixture: ComponentFixture<UserNavigationBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNavigationBar],
    }).compileComponents();

    fixture = TestBed.createComponent(UserNavigationBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
