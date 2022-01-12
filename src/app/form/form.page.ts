import { SelectChildComponent } from '../components/select-child/select-child.component';
import {
  OfferedPlan,
  PlanService,
  ChildPlan,
  Dependant,
  YourPlan,
} from './../services/plan.service';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { ModalController } from '@ionic/angular';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit, OnDestroy {
  @ViewChildren('plans') plan: QueryList<any>;

  pageId: string;
  update: Boolean;

  availablePlans: Observable<OfferedPlan[]>;
  selectedPlanIdx: number;

  offeredPlans: OfferedPlan[];

  childPlan: ChildPlan[] = [];
  dependantList: Dependant[] = [];

  dependant: Dependant;

  planForm: FormGroup = this.fb.group({
    childPlan: this.fb.array([]),
    dependant: this.fb.array([], Validators.required),
  });

  constructor(
    private planService: PlanService,
    private renderer: Renderer2,
    private modal: ModalController,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params.subscribe((params) => {
      // pageId parameter
      this.pageId = params['id'];
    });

    this.availablePlans = this.planService.getOfferedPlans();
    this.selectedPlanIdx = null;
    this.dependant = {
      name: null,
      age: null,
    };
  }

  async ngOnInit() {
    this.availablePlans.subscribe(data => {
      this.offeredPlans = data;
    });

    if (this.pageId === 'new') {
      this.update = false;
      this.dependantFormArray.clear();
      this.childPlanFormArray.clear();
    } else {
      this.update = true;
      const queriedPlan = await this.planService.getPlanById(this.pageId);
      this.selectPlan(queriedPlan.selectedPlanIdx);
      const checkedChildIndexes: number[] = [];

      this.availablePlans.subscribe(originalPlans => {
        originalPlans[this.selectedPlanIdx].childPlan.forEach((child, idx) => {
          queriedPlan.childPlan.forEach((q) => {
            if(q.name === child.name){
              originalPlans[this.selectedPlanIdx].childPlan[idx] = q;
              checkedChildIndexes.push(idx);
            }
          })
        });

        this.offeredPlans = originalPlans;
        
        checkedChildIndexes.forEach(num => {
          this.patchChildPlansToForm(this.offeredPlans,this.selectedPlanIdx, num, this.offeredPlans[this.selectedPlanIdx].childPlan[num].premium, this.offeredPlans[this.selectedPlanIdx].childPlan[num].sumInsured);
        })
      });

      this.dependantList = queriedPlan.dependant;


      this.dependantList.forEach(d => {
        const dependantForm = this.fb.group({
          name: [d.name, Validators.required],
          age: [d.age, Validators.required],
        });
        this.dependantFormArray.push(dependantForm);
      })
    }
  }

  ngOnDestroy(): void {
    // this.selectedPlanIdx = null;
  }

  get dependantFormArray(): FormArray {
    return this.planForm.controls['dependant'] as FormArray;
  }

  get childPlanFormArray(): FormArray {
    return this.planForm.controls['childPlan'] as FormArray;
  }

  selectPlan(idx: number) {
    switch (true) {
      case this.selectedPlanIdx !== null:
        if (this.selectedPlanIdx !== idx) {
          this.resetPlan();
          this.revertHighlightedPlan(this.selectedPlanIdx);
          this.highlightPlan(idx);
          this.selectedPlanIdx = idx;
        }
        break;

      case this.selectedPlanIdx === null:
        this.highlightPlan(idx);
        this.selectedPlanIdx = idx;
        break;

      default:
        break;
    }
  }

  async addChildPlan() {
    const childModal = await this.modal.create({
      component: SelectChildComponent,
      cssClass: 'child-modal',
      showBackdrop: true,
      animated: true,
      backdropDismiss: true,
      componentProps: {
        childs: this.offeredPlans[this.selectedPlanIdx].childPlan,
      },
      id: 'ChildModal',
    });
    await childModal.present();

    await childModal.onDidDismiss().then((list) => {
      switch (list.role) {
        case 'add':
          if (list.data === undefined) {
            console.log('No selections made');
            this.childPlan = [];
          } else {
            this.childPlan = [];
            this.childPlanFormArray.clear();

            if (list.data.length > 0) {
              list.data.forEach((num: number) => {
                this.childPlan.push(
                  this.offeredPlans[this.selectedPlanIdx].childPlan[num]
                );

                this.patchChildPlansToForm(
                  this.offeredPlans,
                  this.selectedPlanIdx,
                  num,
                  this.offeredPlans[this.selectedPlanIdx].childPlan[num].premium,
                  this.offeredPlans[this.selectedPlanIdx].childPlan[num].sumInsured
                );
              });
            }
          }
          break;

        case 'close':
          console.log('Modal closed. Reset selections');
          break;

        default:
          console.log('Modal role undefined');
          break;
      }
    });
  }

  patchChildPlansToForm(
    plans: OfferedPlan[],
    selectedIdx: number,
    num: number,
    premium?: Number | null,
    sumInsured?: Number | null
  ) {
    let childPlanForm: FormGroup = this.fb.group({
      premium: [
        premium,
        [
          this.minValueValidation(plans[selectedIdx].childPlan[num].minPremium),
          this.maxValueValidation(plans[selectedIdx].childPlan[num].maxPremium),
        ],
      ],
      sumInsured: [
        sumInsured,
        [
          this.minValueValidation(
            plans[selectedIdx].childPlan[num].minSumInsured
          ),
          this.maxValueValidation(
            plans[selectedIdx].childPlan[num].maxSumInsured
          ),
        ],
      ],
      name: [plans[selectedIdx].childPlan[num].name],
      minPremium: plans[selectedIdx].childPlan[num].minPremium,
      maxPremium: plans[selectedIdx].childPlan[num].maxPremium,
      minSumInsured: plans[selectedIdx].childPlan[num].minSumInsured,
      maxSumInsured: plans[selectedIdx].childPlan[num].maxSumInsured,
      checked: plans[selectedIdx].childPlan[num].checked,
    });

    this.childPlanFormArray.push(childPlanForm);
  }

  minValueValidation(min: Number | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: Number = control.value;

      if (!value) {
        return null;
      }

      if (min === null) {
        return null;
      } else {
        return value >= min ? null : { min: true };
      }
    };
  }

  maxValueValidation(max: Number | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: Number = control.value;

      if (!value) {
        return null;
      }

      if (max === null) {
        return null;
      } else {
        return value <= max ? null : { max: true };
      }
    };
  }

  public errorMessages = {
    premium: [
      { type: 'min', message: 'It must be more than' },
      { type: 'max', message: 'It must be less than' },
    ],
    sumInsured: [
      { type: 'min', message: 'It must be more than' },
      { type: 'max', message: 'It must be less than' },
    ],
  };

  addDependant() {
    const dependantForm = this.fb.group({
      name: [null, Validators.required],
      age: [null, Validators.required],
    });

    this.dependantFormArray.push(dependantForm);
    this.dependantList.push(this.dependant);
  }

  async submit() {
    await this.planService.getYourPlan().then((jsonString) => {
      let conv: YourPlan[] = JSON.parse(jsonString);

      let yrPlanLen: number = 0;
      if (conv !== null) {
        yrPlanLen = conv.length;
      } else {
        conv = [];
      }

      const final: YourPlan = {
        id: `${yrPlanLen + 1}`,
        selectedPlanIdx: this.selectedPlanIdx,
        ...this.planForm.value,
      };

      conv.push(final);

      this.planService.addToYourPlan(conv);
      this.router.navigateByUrl('home');
    });
  }

  async updateForm() {
    await this.planService.getYourPlan().then((jsonString) => {
      let conv: YourPlan[] = JSON.parse(jsonString);

      const final: YourPlan = {
        id: `${this.pageId}`,
        selectedPlanIdx: this.selectedPlanIdx,
        ...this.planForm.value,
      };
      
      conv.forEach((each, idx) => {
        if(each.id === this.pageId) {
          conv[idx] = final;
        }
      });

      this.planService.addToYourPlan(conv);
      this.router.navigateByUrl('home');
    })
  }

  priceValueToString(value: number) {
    return value === null ? 'N/A' : `RM ${value}`;
  }

  resetPlan() {
    this.childPlan = [];

    this.childPlanFormArray.clear();
    this.availablePlans.subscribe((plans) => {
      plans[this.selectedPlanIdx].childPlan.forEach((child) => {
        child.checked = false;
      });

      this.availablePlans = of(plans);
    });
  }

  highlightPlan(idx: number) {
    const name = this.plan.get(idx).nativeElement.firstChild as ElementRef;
    const circle = this.plan.get(idx).nativeElement.lastChild as ElementRef;

    this.renderer.setStyle(
      this.plan.get(idx).nativeElement,
      'border',
      `1px solid orange`
    );
    this.renderer.setStyle(name, 'color', `orange`);
    this.renderer.setStyle(circle, 'background', `orange`);
    this.renderer.setStyle(circle, 'border', `1px solid orange`);

    this.availablePlans.subscribe((plans) => {
      plans[idx].checked = true;
      this.availablePlans = of(plans);
    });
  }

  revertHighlightedPlan(idx: number) {
    const name = this.plan.get(idx).nativeElement.firstChild as ElementRef;
    const circle = this.plan.get(idx).nativeElement.lastChild as ElementRef;

    this.renderer.setStyle(
      this.plan.get(idx).nativeElement,
      'border',
      `1px solid rgb(189, 189, 189)`
    );
    this.renderer.setStyle(name, 'color', `rgb(150, 150, 150)`);
    this.renderer.setStyle(circle, 'background', `transparent`);
    this.renderer.setStyle(circle, 'border', `1px solid rgb(180, 180, 180)`);

    this.availablePlans.subscribe((plans) => {
      plans[idx].checked = false;
      this.availablePlans = of(plans);
    });
  }
}
