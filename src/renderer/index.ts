import Vue from "vue";
// import Vuex, { StoreOptions } from "vuex";
// import Vuex from "vuex";
// this might look weird but think of this import from this file being inside
// the ./build dir, thus why we walk back.
import App from "../../src/components/App.vue";
// import { AppState } from "../controller/app-state";
// import { Dispatcher } from "../controller/dispatcher";

// Vue.use(Vuex);
// const appState = new AppState();
// const dispatcher = new Dispatcher(appState);
// tslint:disable-next-line:interface-name
// export interface RootState {
//   dispatcher: Dispatcher;
// }
// Vue.config.productionTip = false;
// const stateOptions: StoreOptions<RootState> = {
//   state: {
//     dispatcher: new Dispatcher(appState),
//   },
// };
// const store = new Vuex.Store<RootState>(stateOptions);
// const store = new Vuex.Store({state: dispatcher});
/* eslint-disable no-new */
new Vue({
  components: { App },
  // store,
  template: "<App/>",
}).$mount("#app");



