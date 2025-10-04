import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNavigationBar } from './admin-navigation-bar';

describe('AdminNavigationBar', () => {
  let component: AdminNavigationBar;
  let fixture: ComponentFixture<AdminNavigationBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNavigationBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminNavigationBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
