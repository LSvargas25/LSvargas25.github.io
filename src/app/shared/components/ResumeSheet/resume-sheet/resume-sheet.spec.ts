import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ResumeSheetComponent } from './resume-sheet';

describe('ResumeSheet', () => {
  let component: ResumeSheetComponent;
  let fixture: ComponentFixture<ResumeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeSheetComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeSheetComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
