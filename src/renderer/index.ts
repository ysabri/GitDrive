// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// Initial welcome page. Delete the following line to remove it.

import Vue from "vue";

import App from "../../src/components/App.vue";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: "<App/>",
}).$mount("#app");



