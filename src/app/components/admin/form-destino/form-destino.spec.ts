import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDestino } from './form-destino';

describe('FormDestino', () => {
  let component: FormDestino;
  let fixture: ComponentFixture<FormDestino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormDestino]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormDestino);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
