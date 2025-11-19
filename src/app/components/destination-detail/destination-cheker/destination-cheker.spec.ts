import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationCheker } from './destination-cheker';

describe('DestinationCheker', () => {
  let component: DestinationCheker;
  let fixture: ComponentFixture<DestinationCheker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DestinationCheker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationCheker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
