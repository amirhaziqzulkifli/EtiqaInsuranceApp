import { ModalController } from '@ionic/angular';
import { ChildPlan } from '../../services/plan.service';
import {
  Component,
  Input,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'app-select-child',
  templateUrl: './select-child.component.html',
  styleUrls: ['./select-child.component.scss'],
})
export class SelectChildComponent implements OnInit {
  @Input() childs: ChildPlan[];
  @ViewChildren('selection') selection: QueryList<ElementRef>;

  selectedChild: number[];

  constructor(private modal: ModalController) {
    this.selectedChild = [];
  }

  ngOnInit() {
    this.childs.forEach((child, idx) => {
      if(child.checked){
        this.selectedChild.push(idx);
      }
    })
  }

  select(idx: number) {
    const found = this.selectedChild.findIndex(each => each === idx);

    if(found === -1){
      this.selectedChild.push(idx);
    } else {
      this.selectedChild = this.selectedChild.filter(each => {
        if(each === idx){
          return 0;
        } else {
          return 1;
        }
      })
    }
    this.childs[idx].checked = !this.childs[idx].checked;
  }

  async addPlans() {
    this.selectedChild = this.selectedChild.sort((n1,n2) => {
      if (n1 > n2) {
          return 1;
      }
  
      if (n1 < n2) {
          return -1;
      }
  
      return 0;
    });

    await this.modal.dismiss(this.selectedChild, 'add', 'ChildModal');
    this.selectedChild = [];
  }

  close() {
    this.selectedChild = [];
    this.childs.forEach(child => {
      child.checked = false;
    });

    this.modal.dismiss(null, 'close', 'ChildModal');
  }
}
