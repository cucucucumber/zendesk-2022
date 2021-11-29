import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { STChange, STColumn, STData, STColumnTag } from '@delon/abc/st';
import { dateTimePickerUtil } from '@delon/util/date-time';
import { NzMessageService } from 'ng-zorro-antd/message';
import { of } from 'rxjs';
import { InfoModalComponent } from './infomodal.component';

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
  constructor(private http: HttpClient, private message: NzMessageService) {}

  users: STData[] = [];
  columns: STColumn[] = [
    {
      title: 'Subject',
      index: 'subject',
      sort: {
        compare: (a, b) => a.subject.length - b.subject.length
      }
    },
    {
      title: 'Requester',
      index: 'requester_id',
      sort: {
        compare: (a, b) => a.requester_id - b.requester_id
      },
      filter: {
        type: 'number',
        placeholder: '',
        number: {
          min: 1,
          max: 999999999999999
        },
        fn: (filter, record) => (filter.value != null ? record.requester_id == filter.value : true),
        multiple: true
      }
    },
    {
      title: 'Status',
      type: 'badge',
      index: 'status',
      badge: {
        open: { text: 'open', color: 'success' },
        pending: { text: 'pending', color: 'processing' },
        close: { text: 'close', color: 'error' }
      },
      filter: {
        menus: [
          { text: 'open', value: 'open' },
          { text: 'pending', value: 'pending'},
          { text: 'close', value: 'close' }
        ],
        fn: (filter, record) => record.status >= filter.value[0] && record.status <= filter.value[1],
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
    },
    {
      title: 'Content',
      buttons: [
        {
          text: 'More',
          type: 'modal',
          modal: {
            component: InfoModalComponent
          },
          click: (_record, modal) => this.message.success(`Reloading, data: ${JSON.stringify(modal)}`)
        }
      ]
    }
  ];
  ngOnInit(): void {
    const headers = new HttpHeaders();
    this.http.get('/api/v2/tickets.json', { headers }).subscribe((res: any) => {
      const data = res.tickets;
      of(data).subscribe(res => (this.users = res));
    });
  }

  change(e: STChange): void {
    console.log(e);
  }
}
