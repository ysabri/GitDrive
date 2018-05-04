import { Dispatcher } from "../controller/dispatcher";
// tslint:disable-next-line:interface-name
export interface DispatchState {
  dispatch: Dispatcher;
  first: boolean;
}
// tslint:disable-next-line:interface-name
export interface RootState {
  currentDispatch: DispatchState;
}
