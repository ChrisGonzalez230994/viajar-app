import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pruba } from './pruba';

describe('Pruba', () => {
  let component: Pruba;
  let fixture: ComponentFixture<Pruba>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Pruba]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pruba);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
