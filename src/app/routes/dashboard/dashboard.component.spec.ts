import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed, async } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
//测试入口，参数为测试名、方法
describe('DashboardComponent', () => {
  //每个测试用的Setup
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

  //每个测试用例的TearDown
  afterEach(function () {
    //清除测试数据
  });
});
