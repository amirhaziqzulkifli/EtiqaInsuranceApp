import { YourPlan } from './../services/plan.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlanService } from '../services/plan.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  // yourPlan: Observable<YourPlan[]>;
  yourPlan: Promise<YourPlan[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private planService: PlanService
  ) {
    this.yourPlan = this.planService.getYourPlanJson();
  }

  async ngOnInit() {
    // await this.planService.getYourPlan()
    // .then(plans => {
    //   const conv: YourPlan[] = JSON.parse(plans);
    //   this.yourPlan = of(conv);
    // });

    // const planJSON = await this.planService.getYourPlanJson();
    // console.log(planJSON)
  }

  openForm() {
    this.router.navigateByUrl('form/new');
  }

  updatePlan(id: string) {
    this.router.navigateByUrl(`form/${id}`);
  }

  queryPlanByIdx(idx: number) {
    return this.planService.getPlanNameByIdx(idx);
  }

  price(value: Number | null) {
    return value === null ? "N/A" : `RM ${value}`;
  }
}
