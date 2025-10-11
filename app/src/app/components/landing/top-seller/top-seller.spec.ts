import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopSeller } from './top-seller';

describe('TopSeller', () => {
  let component: TopSeller;
  let fixture: ComponentFixture<TopSeller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopSeller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopSeller);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
