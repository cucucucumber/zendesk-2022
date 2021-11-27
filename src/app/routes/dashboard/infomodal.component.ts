import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: `app-demo-dialog-modal`,
  template: `
    <div class="modal-header">
      <div class="modal-title">Info</div>
    </div>
    <p>参数：{{ record | json }}</p>
    <div class="modal-footer"> </div>
  `
})
export class InfoModalComponent {
  @Input() record: NzSafeAny;

  constructor(private modal: NzModalRef) {}
}
