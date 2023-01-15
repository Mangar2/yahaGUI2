import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesTableComponent } from './rules-table.component';

describe('RulesTableComponent', () => {
  let component: RulesTableComponent;
  let fixture: ComponentFixture<RulesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
