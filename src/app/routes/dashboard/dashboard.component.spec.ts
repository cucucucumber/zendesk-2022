import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, async } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
//Entry point of the testing procedure
describe('DashboardComponent', () => {
  //Setup for each test
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(DashboardComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  //Teardown for each test
  afterEach(function () {
    //We can optionally clean all the testing data
  });
});
