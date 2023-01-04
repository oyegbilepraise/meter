import { defineStore } from "pinia";
import { ICustomer, IRequest } from "../lib/types/request";

export const useStore = defineStore('store', {
  state: () => ({
    request: {
      creditclan_request_id: null,
      id: null,
    } as IRequest,
    customer: {
      email: null,
      phone: null,
    } as ICustomer,
    merchant: {
      id: null
    },
    cc_request: null,
    cc_user: null,
  }),
  getters: {
    itemsTotal: state => {
      return state.request.items?.reduce((acc, i) => acc + +i.price, 0) || 0;
    },
    hasPlan: state => {
      return state.request.items?.every(i => !!i.item_plan.plan);
    },
    plansTotal: state => {
      return state.request.items?.reduce((acc, i) => acc + i.item_plan.plan?.total, 0) || 0;
    },
    plansOutright: state => {
      return state.request.items?.reduce((acc, i) => acc + i.item_plan.plan?.outright, 0) || 0;
    },
    plansMonthly: state => {
      return state.request.items?.reduce((acc, i) => acc + i.item_plan.plan?.monthly, 0) || 0;
    },
    plansDuration: state => {
      return state.request.items?.[0].item_plan.plan.duration || 0;
    },
  }
});
