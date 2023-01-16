import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleNavComponent } from './rule-nav.component';

describe('RuleNavComponent', () => {
  let component: RuleNavComponent;
  let fixture: ComponentFixture<RuleNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RuleNavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
