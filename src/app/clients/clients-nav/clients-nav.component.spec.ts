import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsNavComponent } from './clients-nav.component';

describe('ClientsNavComponent', () => {
  let component: ClientsNavComponent;
  let fixture: ComponentFixture<ClientsNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsNavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
