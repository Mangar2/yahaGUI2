import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsControllerComponent } from './settings-controller.component';

describe('SettingsControllerComponent', () => {
  let component: SettingsControllerComponent;
  let fixture: ComponentFixture<SettingsControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsControllerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
