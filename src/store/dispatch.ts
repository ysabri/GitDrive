import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import { AppState } from "../controller/app-state";
import { Dispatcher } from "../controller/dispatcher";
import { TopicSpace } from "../model/app/topicspace";
import { DispatchState, RootState } from "./";

export type dispatchContext = ActionContext<DispatchState, RootState>;
// I only do this to prevent the compiler form complaining
// tslint:disable-next-line:no-unused-expression
Store.length;
const appState = new Dispatcher(new AppState());

export const dispaVuex = {
  namespaced: true,

  state: {
    dispatch: appState,
  },

  getters: {
    getFTime(state: DispatchState): boolean {
      return state.dispatch.fistTime;
    },
    getTSs(state: DispatchState): ReadonlyArray<TopicSpace> | undefined {
        return state.dispatch.TSs;
    },
  },
};

const {read} = getStoreAccessors<DispatchState, RootState>("dispaVuex");

export const readFtime = read(dispaVuex.getters.getFTime);
export const readTSs = read(dispaVuex.getters.getTSs);
