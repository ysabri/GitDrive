import { ActionContext, Store } from "vuex";
import { getStoreAccessors } from "vuex-typescript";
import { AppState } from "../controller/app-state";
import { Dispatcher } from "../controller/dispatcher";
import { GRepository, TopicSpace, User } from "../model/app";
import { DispatchState, RootState } from "./";

export type dispatchContext = ActionContext<DispatchState, RootState>;
// I only do this to prevent the compiler form complaining
// tslint:disable-next-line:no-unused-expression
Store.length;
const appState = new Dispatcher(new AppState());

export const dispaVuex = {
  namespaced: true,

  actions: {
    async loadRepo(context: dispatchContext): Promise<GRepository> {
      return await context.state.dispatch.loadNewRepo();
    },
  },
  getters: {
    getFTime(state: DispatchState): boolean {
      return state.dispatch.fistTime;
    },
    getTSs(state: DispatchState): ReadonlyArray<TopicSpace> | undefined {
        return state.dispatch.TSs;
    },
    getCurrentRepo(state: DispatchState): GRepository | undefined {
      return state.dispatch.currentRepo;
    },
  },
  mutations: {
    changeCurrRepo(state: DispatchState, repo: GRepository) {
      state.dispatch.changeCurrRepo(repo);
    },
  },
  state: {
    dispatch: appState,
  },
};

const {commit, read, dispatch} = getStoreAccessors<DispatchState, RootState>("dispaVuex");

const getters = dispaVuex.getters;

export const readFtime = read(getters.getFTime);
export const readTSs = read(getters.getTSs);
export const readCurrRepo = read(getters.getCurrentRepo);

const actions = dispaVuex.actions;

export const dispatchloadRepo = dispatch(actions.loadRepo);

const mutations = dispaVuex.mutations;

export const commitCurrRepo = commit(mutations.changeCurrRepo);
