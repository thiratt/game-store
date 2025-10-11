import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Static } from './static';

describe('Static', () => {
  let component: Static;
  let fixture: ComponentFixture<Static>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Static]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Static);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
