import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";

import { AppState } from "../controller/app-state";
import { Dispatcher } from "../controller/dispatcher";

export type dispatchContext = ActionContext<DispatchState, RootState>;
// tslint:disable-next-line:no-unused-expression
Store.length;
const appState = new AppState();
// tslint:disable-next-line:interface-name
export interface DispatchState {
  dispatch: Dispatcher;
}
// tslint:disable-next-line:interface-name
export interface RootState {
  currentDispatch: DispatchState;
}
export const dispaVuex = {
  namespaced: true,

  state: {
    dispatch: new Dispatcher(appState),
  },

  getters: {
    getFTime(state: DispatchState): boolean {
      return state.dispatch.fistTime;
    },
  },
};

const {read} = getStoreAccessors<DispatchState, RootState>("GitDrive");

export const readFtime = read(dispaVuex.getters.getFTime);
