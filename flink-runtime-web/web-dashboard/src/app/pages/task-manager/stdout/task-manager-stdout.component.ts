/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { EditorOptions } from 'ng-zorro-antd/code-editor/typings';
import { flinkEditorOptions } from 'share/common/editor/editor-config';

import { TaskManagerDetailInterface } from 'interfaces';
import { TaskManagerService } from 'services';

@Component({
  selector: 'flink-task-manager-stdout',
  templateUrl: './task-manager-stdout.component.html',
  styleUrls: ['./task-manager-stdout.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskManagerStdoutComponent implements OnInit, OnDestroy {
  stdout = '';
  loading = true;
  editorOptions: EditorOptions = flinkEditorOptions;
  taskManagerDetail: TaskManagerDetailInterface;
  private destroy$ = new Subject<void>();

  reload(): void {
    this.loading = true;
    this.cdr.markForCheck();
    if (this.taskManagerDetail) {
      this.taskManagerService
        .loadStdout(this.taskManagerDetail.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          data => {
            this.loading = false;
            this.stdout = data;
            this.cdr.markForCheck();
          },
          () => {
            this.cdr.markForCheck();
          }
        );
    }
  }

  constructor(private taskManagerService: TaskManagerService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.taskManagerService.taskManagerDetail$.pipe(first(), takeUntil(this.destroy$)).subscribe(data => {
      this.taskManagerDetail = data;
      this.reload();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
