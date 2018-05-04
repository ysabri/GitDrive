import Vue from "vue";
import * as Vuex from "vuex";
// this might look weird but think of this import from this file being inside
// the ./build dir, thus why we walk back.
import App from "../../src/components/App.vue";
import { dispaVuex, RootState } from "../store";

Vue.config.productionTip = false;
Vue.use(Vuex);

const store = new Vuex.Store<RootState>({
  modules: {
    dispaVuex,
  },
  strict: process.env.NODE_ENV !== "production",
});

new Vue({
  components: { App },
  store,
  template: "<App/>",
}).$mount("#app");

