import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsControllerComponent } from './clients-controller.component';

describe('ClientsControllerComponent', () => {
  let component: ClientsControllerComponent;
  let fixture: ComponentFixture<ClientsControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientsControllerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
