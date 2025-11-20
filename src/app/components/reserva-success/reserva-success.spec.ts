import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaSuccess } from './reserva-success';

describe('ReservaSuccess', () => {
  let component: ReservaSuccess;
  let fixture: ComponentFixture<ReservaSuccess>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservaSuccess],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservaSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
