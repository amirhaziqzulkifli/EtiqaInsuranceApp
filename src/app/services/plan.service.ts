import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Storage } from '@capacitor/storage';

export interface Dependant {
  name: string,
  age: string
}

export interface ChildPlan {
  name: string,
  minPremium?: Number,
  maxPremium?: Number,
  minSumInsured?: Number,
  maxSumInsured?: Number,
  checked?: Boolean,
  premium?: Number,
  sumInsured?: Number,
}

export interface OfferedPlan {
  id: string,
  name: string,
  childPlan?: ChildPlan[]
  checked?: Boolean,
}

export interface YourPlan {
  id: string,
  selectedPlanIdx: number,
  selectedPlan?: OfferedPlan,
  childPlan: ChildPlan[],
  dependant?: Dependant[],
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  offeredPlans: OfferedPlan[] = [
    {
      id: "1",
      name: 'Product ABC',
      childPlan: [
        {
          name: 'Rider A',
          minPremium: 100, 
          maxPremium: 500,
          minSumInsured: 100000, 
          maxSumInsured: 200000,
          checked: false
        }
      ],
      checked: false
    },
    {
      id: "2",
      name: 'Product DEF',
      childPlan: [
        {
          name: 'Rider A',
          minPremium: 100, 
          maxPremium: 500,
          minSumInsured: 100000, 
          maxSumInsured: 200000,
          checked: false
        },
        {
          name: 'Rider B',
          minPremium: 200,
          maxPremium: 1000,
          minSumInsured: 200000,
          maxSumInsured: null,
          checked: false
        }
      ],
      checked: false
    },
    {
      id: "3",
      name: 'Product GHI',
      childPlan: [
        {
          name: 'Rider A',
          minPremium: 100, 
          maxPremium: 500,
          minSumInsured: 100000, 
          maxSumInsured: 200000,
          checked: false
        },
        {
          name: 'Rider B',
          minPremium: 200,
          maxPremium: 1000,
          minSumInsured: 200000,
          maxSumInsured: null,
          checked: false
        },
        {
          name: 'Rider C',
          minPremium: 300,
          maxPremium: 2000, 
          minSumInsured: 300000, 
          maxSumInsured: 500000,
          checked: false
        }
      ],
      checked: false
    }
  ];

  yourplan: YourPlan[] = [];

  constructor(public http: HttpClient) { }

  getOfferedPlans(): Observable<OfferedPlan[]> {
    return of(this.offeredPlans);
  }

  async getYourPlan() {
    return await Storage.get({
      key: 'yrPlan'
    })
    .then(result => result.value)
    .catch(() => null);
  }

  async addToYourPlan(value: YourPlan[]) {
    const planString = JSON.stringify(value);
    return await Storage.set({
      key: 'yrPlan',
      value: planString
    })
  }

  getPlanNameByIdx(idx: number) {
    return this.offeredPlans[idx].name;
  }

  async getYourPlanJson(): Promise<YourPlan[] | null>{
    const { value } = await Storage.get({ key: 'yrPlan'});
    const conv: YourPlan[] = JSON.parse(value);
    
    if(conv !== null){
      return conv;
    } else {
      return null;
    }
  }

  async getPlanById(id: string) {
    const { value } = await Storage.get({ key: 'yrPlan'});
    const plans: YourPlan[] = JSON.parse(value);

    return plans.find(plan => plan.id === id);
  }
}
