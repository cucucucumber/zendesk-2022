import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: `app-demo-dialog-modal`,
  template: 
  `
    <div class="modal-header">
      <div class="modal-title">Ticket Content</div>
    </div>
    <p> Requester: {{ record.requester_id }} </p>
    <p> Assignee: {{ record.assignee_id }} </p>
    <p> Subject: {{ record.subject }} </p>
    <p> Description: {{ record.description }} </p>
    <p> Tags: {{ record.tags }} </p>
    <p> Status: {{ record.status }} </p>
    <div class="modal-footer"> </div>
  `
})

export class InfoModalComponent {
  @Input() record: NzSafeAny;

  constructor(private modal: NzModalRef) {}
}
