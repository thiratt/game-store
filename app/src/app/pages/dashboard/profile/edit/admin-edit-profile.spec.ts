import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditProfile } from './admin-edit-profile';

describe('AdminEditProfile', () => {
  let component: AdminEditProfile;
  let fixture: ComponentFixture<AdminEditProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEditProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
