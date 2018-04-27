import Vue from "vue";
// this might look weird but think of this import from this file being inside
// the ./build dir, thus why we walk back.
import App from "../../src/components/App.vue";
import { Loader } from "../controller/loader";

const loaded = new Loader();

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: "<App/>",
}).$mount("#app");


