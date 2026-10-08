import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseProjectModalComponent } from './base-project-modal.component';

describe('BaseProjectModalComponent', () => {
  let component: BaseProjectModalComponent;
  let fixture: ComponentFixture<BaseProjectModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseProjectModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseProjectModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
