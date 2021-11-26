import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { STChange, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { dateTimePickerUtil } from '@delon/util/date-time';
import { of } from 'rxjs';

const TAG: STColumnTag = {
  sample: { text: 'sample', color: 'green' },
  zendesk: { text: 'zendesk', color: 'yellow' },
  support: { text: 'support', color: 'blue' }
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  users: STData[] = [];
  columns: STColumn[] = [
    {
      title: 'ID',
      index: 'id',
      type: 'checkbox'
    },
    {
      title: 'Subject',
      index: 'subject',
      sort: {
        compare: (a, b) => a.name.length - b.name.length
      }
    },
    {
      title: 'Submitter',
      index: 'submitter_id',
      sort: {
        compare: (a, b) => a.submitter_id - b.submitter_id
      },
      filter: {
        type: 'number',
        placeholder: '',
        number: {
          min: 100000000000,
          max: 999999999999
        },
        fn: (filter, record) => (filter.value != null ? record.age >= +filter.value : true)
      }
    },
    {
      title: 'Status',
      type: 'badge',
      index: 'status',
      badge: {
        open: { text: 'open', color: 'success' },
        close: { text: 'close', color: 'error' }
      },
      filter: {
        menus: [
          { text: 'open', value: 'open' },
          { text: 'close', value: 'close' }
        ],
        fn: (filter, record) => record.age >= filter.value[0] && record.age <= filter.value[1],
        multiple: true
      }
    },
    // {
    //   title: 'Tags',
    //   type: 'tag',
    //   index: 'tags',
    //   tag: TAG
    // },
    {
      title: 'Date',
      index: 'created_at',
      type: 'date',
      filter: {
        type: 'date',
        date: {
          mode: 'date',
          showToday: false,
          disabledDate: dateTimePickerUtil.disabledAfterDate()
        },
        fn: () => true
      }
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const headers = new HttpHeaders().append('Authorization', `Basic ${btoa('simth.rock@8iy3.onmicrosoft.com:uSC4q..Mnk7UkNJ')}`);
    this.http.get('/api/v2/tickets.json', { headers }).subscribe((res: any) => {
      console.log(res);
      const data = res.tickets;
      of(data).subscribe(res => (this.users = res));
    });
  }

  change(e: STChange): void {
    console.log(e);
  }
}
