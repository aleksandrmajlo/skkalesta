<template>
    <div v-cloak v-if="!errorPage">
        <div class="h3 pb-2">{{title}}</div>
        <div class="row">

            <div class="col-lg-12">
                
                <!-- <div class="alert alert-danger text-center" v-show="errorPage"> -->
                    <!-- Для данной услуги не указаны работы. -->
                <!-- </div> -->

                <template v-if="calc_items.length>0">
                    <tabs>
                        <tab v-for="(item,index) in calc_items" :key="index" :id="'tabs'+(index+1)"
                             :name="item['наименование_работ']">
                            <div class="tab_content">
                                <table class=" table_calc table table-striped table-light">
                                    <thead>
                                    <tr>
                                        <th scope="col"></th>
                                        <th scope="col">Наименование работ</th>
                                        <th scope="col">Ед. изм.</th>
                                        <th scope="col">Цена за ед.</th>
                                        <th scope="col">Кол-во</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="(calc,index_) in item.works" :key="index_" class="tab-item">
                                        <td>
                                            <label class="custom-input">
                                                <input type="checkbox" @input="setState(index,index_,$event)"
                                                       class="custom-input__input ">
                                                <span class="custom-input__lab"></span>
                                            </label>
                                        </td>
                                        <td class="name">

                                            <template v-if="calc.description!==''">
                                                <v-popover
                                                >
                                                    <div class="tooltip-target b3">
                                                        {{calc.name}}
                                                    </div>
                                                    <template slot="popover">
                                                        <p class="content_popover" v-html="calc.description"></p>
                                                        <span class="btn btn-warning-2" v-close-popover>Закрыть</span>
                                                    </template>
                                                </v-popover>

                                            </template>
                                            <template v-else>
                                                {{calc.name}}
                                            </template>


                                        </td>
                                        <td>
                                            {{calc.edinitsa_izmereniia}}
                                        </td>
                                        <td>
                                            <span class="price">
                                               {{calc.price|formatCurrency}}
                                            </span>
                                            
                                        </td>
                                        <td>
                                            <input @input="setValue(index,index_,$event)" class="form-control" value="0"
                                                   min="0" type="number">
                                        </td>
                                    </tr>
                                    </tbody>

                                </table>
                            </div>
                        </tab>
                    </tabs>
                </template>
            </div>
        </div>


        <div class="row text-center calc_block" v-show="loader&&!errorPage" v-cloak>
            <div class="col-lg-12">

                 <div class="alert alert-danger text-center" v-show="errorWork">
                      Необходимо выбрать работу и указать количество.
                 </div>
                <button @click.prevent="calc" v-show="resetCalc" class="form-wrap__btn btn btn-warning" type="button">Рассчитать</button>
                <button @click.prevent="reset"  v-show="!resetCalc" class="form-wrap__btn btn btn-warning" type="button">Посчитать заново</button>

            </div>
        </div>
        <div class="form-wrap__foot pb-3"  v-cloak>
          
            <div class="h3  text-center"  v-show="!resetCalc">Итого: {{total|formatCurrency}} руб*</div>

        </div>
    </div>
</template>
<script>
import Vue from "vue";
import { Tabs, Tab } from "vue-tabs-component";
import { VTooltip, VPopover, VClosePopover } from "v-tooltip";

Vue.directive("tooltip", VTooltip);
Vue.directive("close-popover", VClosePopover);
Vue.component("v-popover", VPopover);

function formatNumber(n, c, d, t) {
  var c = isNaN((c = Math.abs(c))) ? 2 : c,
    d = d === undefined ? "." : d,
    t = t === undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
    j = (j = i.length) > 3 ? j % 3 : 0;
  return (
    s +
    (j ? i.substr(0, j) + t : "") +
    i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
    (c
      ? d +
        Math.abs(n - i)
          .toFixed(c)
          .slice(2)
      : "")
  );
}

let fullAddress =
  location.protocol +
  "//" +
  location.hostname +
  (location.port ? ":" + location.port : "");
if (location.port) {
  var rest_url = "http://kalesta.local/wp-json/calc/v2/my_meta_query";
} else {
  var rest_url = fullAddress + "/wp-json/calc/v2/my_meta_query";
}
export default {
  data() {
    return {
      area: 0,
      work: 0,
      total: 0,
      title: "",
      text_bottom_calc: "",
      calc_items: [],
      loader: false,
      errorPage: false,
      resetCalc: true, // посчитать заново
      errorWork: false // ошибка не выбрана работа
    };
  },
  components: {
    Tabs,
    Tab
  },
  mounted() {
    this.$http
      .get(rest_url)
      .then(response => {
        this.text_bottom_calc = response.data.text_bottom_calc;
        this.title = response.data.title;

        setTimeout(() => {
          this.loader = true;
        }, 1000);
        if (typeof the_id_global !== "undefined") {
          let add = false;
          response.data.calc_items.forEach(element => {
            if (element.default_uclugi_calc == the_id_global) {
              this.calc_items.push(element);
              add = true;
            }
          });
          if (!add) {
            this.errorPage = true;
            jQuery('#app').parent().addClass('d-none');

          }
        } else {
          this.calc_items = response.data.calc_items;
        }
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    setState(index, index_, $event) {
      if (event.target.checked) {
        this.calc_items[index].works[index_].checked = true;
      } else {
        this.calc_items[index].works[index_].checked = false;
      }
    },
    setValue(index, index_, $event) {
      this.calc_items[index].works[index_].count = $event.target.value;
    },
    calc() {
      let total = 0;
      let ar = [];

      this.calc_items.forEach((element, index) => {
        element.works.forEach((el, ind) => {
          if (typeof el.checked !== "undefined" && el.checked) {
            if (typeof el.count !== "undefined") {
              ar.push({
                name: el.name,
                count: el.count
              });
              total += parseInt(el.price) * parseInt(el.count);
            }
          }
        });
      });
      if (ar.length === 0) {
        this.errorWork = true;
        return false;
      } else {
        this.errorWork = false;
        this.total = Math.ceil(total);
        this.resetCalc= false;
        jQuery('.form_calc').removeClass('hidden_');
        jQuery("#modal-calc")
          .find('[name="total"]')
          .val(this.total);
        jQuery("#modal-calc")
          .find('[name="work"]')
          .val(JSON.stringify(ar));
      }
    },
    reset(){
         this.resetCalc= true;
        jQuery('.form_calc').addClass('hidden_');
    }

 
  },
  filters: {
    formatCurrency(value) {
      return formatNumber(value, 0, " ", " ");
    }
  }
};
</script>
<style lang="scss">
.tabs-component {
  margin: 2em 0;
  width: 100%;
}

.tabs-component-tabs {
  border: solid 1px #ddd;
  border-radius: 6px;
  margin-bottom: 5px;
}

@media (min-width: 700px) {
  .tabs-component-tabs {
    border: 0;
    align-items: stretch;
    display: flex;
    justify-content: flex-start;
    margin-bottom: -1px;
  }
}

.tabs-component-tab {
  color: #999;
  font-size: 14px;
  font-weight: 600;
  margin-right: 0;
  list-style: none;
}

.tabs-component-tab:not(:last-child) {
  border-bottom: dotted 1px #ddd;
}

.tabs-component-tab:hover {
  color: #666;
}

.tabs-component-tab.is-active {
  color: #000;
}

.tabs-component-tab.is-disabled * {
  color: #cdcdcd;
  cursor: not-allowed !important;
}
@media (min-width: 700px) {
  .tabs-component-tab {
    background-color: #fff;
    border: solid 1px #ddd;
    border-radius: 3px 3px 0 0;
    margin-right: 0.5em;
    transform: translateY(2px);
    // transition: transform 0.3s ease;
    &:not(.is-active) {
      margin-bottom: 2px;
    }
  }
  .tabs-component-tab.is-active {
    border-bottom: solid 1px #fff;
    z-index: 2;
    transform: translateY(0);
  }
}

.tabs-component-tab-a {
  align-items: center;
  color: inherit;
  display: flex;
  padding: 0.75em 1em;
  text-decoration: none;
}

.tabs-component-panels {
  padding: 4em 0;
}

@media (min-width: 700px) {
  .tabs-component-panels {
    border-top-left-radius: 0;
    background-color: #fff;
    border: solid 1px #ddd;
    border-radius: 0 6px 6px 6px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    padding: 4em 2em;
  }
}

.tab_content {
  overflow-x: auto;
  table.table_calc {
    th {
      text-align: left !important;
    }
    td {
      text-align: left !important;
      vertical-align: middle !important;
    }
    td.name {
      width: 60%;
    }
    .price {
      white-space: nowrap;
    }
  }
  input.form-control {
    min-width: 80px;
  }
}

.calc_block {
  button {
    margin-bottom: 1rem;
  }
}

@media (max-width: 380px) {
  .tab_content {
    table.table_calc {
      td {
        font-size: 0.7rem;
      }
      td.name {
        width: auto;
      }
    }
    input.form-control {
      min-width: 50px;
      max-width: 50px;
    }
  }
}

// **********************
.tooltip {
  display: block !important;
  z-index: 10000;
}
.tooltip .tooltip-inner {
  background: black;
  color: white;
  border-radius: 16px;
  padding: 5px 10px 4px;
  max-width: inherit;
}
.tooltip .tooltip-arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  margin: 5px;
  border-color: black;
  z-index: 1;
}
.tooltip[x-placement^="top"] {
  margin-bottom: 5px;
}
.tooltip[x-placement^="top"] .tooltip-arrow {
  border-width: 5px 5px 0 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  bottom: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}
.tooltip[x-placement^="bottom"] {
  margin-top: 5px;
}
.tooltip[x-placement^="bottom"] .tooltip-arrow {
  border-width: 0 5px 5px 5px;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
  border-top-color: transparent !important;
  top: -5px;
  left: calc(50% - 5px);
  margin-top: 0;
  margin-bottom: 0;
}
.tooltip[x-placement^="right"] {
  margin-left: 5px;
}
.tooltip[x-placement^="right"] .tooltip-arrow {
  border-width: 5px 5px 5px 0;
  border-left-color: transparent !important;
  border-top-color: transparent !important;
  border-bottom-color: transparent !important;
  left: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}
.tooltip[x-placement^="left"] {
  margin-right: 5px;
}
.tooltip[x-placement^="left"] .tooltip-arrow {
  border-width: 5px 0 5px 5px;
  border-top-color: transparent !important;
  border-right-color: transparent !important;
  border-bottom-color: transparent !important;
  right: -5px;
  top: calc(50% - 5px);
  margin-left: 0;
  margin-right: 0;
}
.tooltip.popover .popover-inner {
  background: #f9f9f9;
  color: black;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(black, 0.1);
}
.tooltip.popover .popover-arrow {
  border-color: #f9f9f9;
}

.tooltip[aria-hidden="true"] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s, visibility 0.15s;
}
.tooltip[aria-hidden="false"] {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s;
}
.tooltip.info .tooltip-inner {
  background: rgba(0, 68, 153, 0.9);
  color: #fff;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
  max-width: 250px;
}
.tooltip.info .tooltip-arrow {
  border-color: rgba(0, 68, 153, 0.9);
}
.tooltip.popover .popover-inner {
  background: #f9f9f9;
  color: #000;
  padding: 24px;
  border-radius: 5px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
}
.tooltip.popover .popover-arrow {
  border-color: #f9f9f9;
}
.tooltip.tooltip-loading .tooltip-inner {
  color: #7af;
}
.it-has-a-tooltip {
  cursor: pointer;
}
.tooltip {
  .content_popover {
    text-align: left;
  }
  .popover {
    $color: #f9f9f9;
    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }
    .popover-arrow {
      border-color: $color;
    }
  }
}

.tooltip-target {
  cursor: pointer;
  text-decoration: underline;
}
</style>

