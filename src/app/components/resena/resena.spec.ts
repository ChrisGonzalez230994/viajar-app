import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Resena } from './resena';

describe('Resena', () => {
  let component: Resena;
  let fixture: ComponentFixture<Resena>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Resena]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Resena);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
