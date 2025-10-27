import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCoupon } from './add';

describe('Add', () => {
  let component: AddCoupon;
  let fixture: ComponentFixture<AddCoupon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCoupon],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCoupon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
