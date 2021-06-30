import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Simplert from "vue2-simplert-plugin";
import Paginate from "vuejs-paginate";

require("vue2-simplert-plugin/dist/vue2-simplert-plugin.css");

Vue.use(Simplert);
Vue.component("paginate", Paginate);
Vue.config.productionTip = false;

Vue.directive("focus", {
  inserted: function (el) {
    el.focus();
  },
});

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");

Date.prototype.getWeek = function () {
  var onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil(((this - onejan) / 86400000 + onejan.getDay() + 1) / 7);
};
