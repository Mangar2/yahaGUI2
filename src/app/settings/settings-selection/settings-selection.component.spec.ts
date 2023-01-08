import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsSelectionComponent } from './settings-selection.component';

describe('SettingsSelectionComponent', () => {
  let component: SettingsSelectionComponent;
  let fixture: ComponentFixture<SettingsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
