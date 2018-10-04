import Vue from "vue";
import Axios from "axios";
Vue.prototype.$http = Axios;
import Otzyvy from "./components/Otzyvy.vue";
import calc from "./components/Calc.vue";
import calchome from "./components/Calchome.vue";

Vue.directive("mask", {
  bind: function(el) {
    jQuery(el)
      .attr("pattern", "[+]7[(][0-9]{3}[)][0-9]{3}-[0-9]{2}-[0-9]{2}")
      .inputmask({
        mask: "+ 7 (999) 999-99-99"
      });
  }
});

if (document.getElementById("app")) {
  const app = new Vue({
    el: "#app",
    components: { Otzyvy, calc, calchome },
    data: {}
  });
}
