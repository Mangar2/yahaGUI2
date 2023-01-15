import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesControllerComponent } from './rules-controller.component';

describe('RulesControllerComponent', () => {
  let component: RulesControllerComponent;
  let fixture: ComponentFixture<RulesControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesControllerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
