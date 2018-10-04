<template>
    <div  v-cloak>
                    <div class="row align-items-center">

                        <div class="col-xl-auto col-lg-12 col-md pb-2">
                            <div class="form-wrap__title mb-2">{{title}}</div>
                        </div>

                        <div class="col-md-auto col-12">
                            <div class="row small-row">
                                <div class="col-md-auto col pb-2">
                                    <div class="form-wrap__input-wrap form-group">
                                        <select v-model="work" class="form-wrap__input form-control">
                                                <option v-for="(item,index) in calc_items" :value="item" :key="index">
                                                  {{ item['name'] }}
                                                </option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-auto pb-2">
                                    <div class="form-wrap__input-wrap form-group">
                                        <input v-model.number="area"
                                               class="form-wrap__input form-control form-wrap__input form-wrap__input--count"
                                               type="number" placeholder="0"/>
                                        <div class="form-wrap__caption small">м2
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg col-md-8">
                            <div class="row small-row">
                                <div class="col-md-6 pb-2">
                                    <div class="form-wrap__input-wrap form-group">
                                        <input
                                            v-model="name"
                                            class="form-wrap__input form-control" type="text"
                                            placeholder="Ваше имя"/>
                                    </div>
                                </div>
                                <div class="col-md-6 pb-2">
                                    <div class="form-wrap__input-wrap form-group">
                                        <input
                                            @keyup="setPhonevalue"
                                            v-mask 
                                            class="form-wrap__input form-control" 
                                            type="text"
                                            placeholder="+ 7 (___) ___ - __ - __"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-auto col-md-4 pb-2">
                            <div class="row">
                                <div class="col-md-12 col-6">
                                    <div class="form-wrap__input-wrap form-group">
                                        <input
                                            @click.prevent="send"
                                            class="form-wrap__btn btn btn-warning"
                                             type="submit"
                                            value="Рассчитать"/>
                                    </div>
                                </div>
                                <div class="col d-md-none" v-show="show">Итого:
                                    <div class="h4">{{total|formatCurrency}} р.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col order-lg-0 order-last">
                            <label class="custom-input custom-input--polite smallest d-block">
                                <input v-model="polite" 
                                       :value="true" 
                                       class="custom-input__input custom-input__input--polite"   
                                       type="checkbox"/>
                                <span class="custom-input__lab"> </span>
                                <span  class="custom-input__text">Я соглашаетесь с
                                    <a target="_blank" class="tdu text-body"  :href="page_politik_form"> политикой конфиденциальности  </a>
                                    и условиями обработки
                                    <a  target="_blank" class="tdu text-body" :href="page_kond_form"> персональных данных</a>
                                    <span  class="d-block text-gray">* Данный рассчет является примерным. Окончательную цену может назвать наш специалист по телефону
                                    </span>
                                </span>
                            </label>
                        </div>

                        <div class="col-xl-auto col-lg-4 text-xl-left text-lg-right" v-show="show"> 
                            <div class="row align-items-center">
                                <div class="col-xl-auto col-lg-12 col-md-auto pb-2 d-none d-lg-block">
                                    <div class="h3 mb-0">Итого: {{total|formatCurrency}} руб*</div>
                                </div>
                                <div class="col-xl-auto col-lg-12 col-md-auto pb-2">
                                    <a @click.prevent="reset" class="form-wrap__reset text-body tdu" href="#">Рассчитать заново</a>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="row">
                        <div class="col-md-12 text-center">
                            <div style="margin-bottom:10px;" class=" text-warning" v-show="worker">Выберите работу</div> 
                            <div style="margin-bottom:10px;" class=" text-warning" v-show="nameer">Укажите Ваше имя</div> 
                            <div  style="margin-bottom:10px;" class="text-warning" v-show="phoneer">Укажите Ваш телефон</div> 
                            <div  style="margin-bottom:10px;" class="text-warning" v-show="politikError">Вы должны согласиться с условиями</div> 
                        </div>
                    </div>
    </div>     
</template>
<script>
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
  var rest_url = "http://kalesta.local/wp-json/calchome/v2/my_meta_query";
} else {
  var rest_url = fullAddress + "/wp-json/calchome/v2/my_meta_query";
}

export default {
  data() {
    return {
      title: "",
      total:0,
      page_kond_form: "",
      page_politik_form: "",
      work: 0,
      area: 0,
      calc_items: [],
      name: "",
      phone: "",
      worker:false,
      polite: true,
      nameer: false,
      phoneer: false,
      politikError:false,
      show:false,
    };
  },
  mounted() {
    this.$http
      .get(rest_url)
      .then(response => {
        this.title = response.data.title;
        this.page_kond_form = response.data.page_kond_form;
        this.page_politik_form = response.data.page_politik_form;
        this.calc_items = response.data.calc_items;
        
      })
      .catch(error => {
        console.log(error);
      });
  },
  computed: {

  },
  methods: {
    calc() {
      this.total = Math.ceil(
        parseInt(this.area) * parseInt(this.work["price"])
      );
    },
    setPhonevalue(e) {
      this.value = $(e.target).inputmask("unmaskedvalue");
      if (this.value.length == 10) {
        this.phone = this.value;
      } else {
        this.phone = false;
      }
    },
    send() {
      this.worker = false;
      this.nameer = false;
      this.phoneer = false;
      let v = true;
     if(this.work===0){
        this.worker = true;
        v = false;
      }
      if (this.name == "") {
        this.nameer = true;
        v = false;
      }
      if (!this.phone) {
        this.phoneer = true;
        v = false;
      }
      if(!this.polite){
         v = false;
      }
      if (v) {
        // отправка
        jQuery("#form_calc_home")
          .find('[name="total"]')
          .val(this.total);
        jQuery("#form_calc_home")
          .find('[name="area"]')
          .val(this.area);
        jQuery("#form_calc_home")
          .find('[name="work"]')
          .val(this.work["наименование_работ"]);
        jQuery("#form_calc_home")
          .find('[name="your-name"]')
          .val(this.name);
        jQuery("#form_calc_home")
          .find('[name="tel-196"]')
          .val(this.phone);
        
        this.calc();
        this.show=true;
        document.getElementById("send_calc_home").click();
 
      }
    },
    reset() {
      this.area = 0;
      this.show=false; 
    }
  },
  watch:{
       polite(val){

          if(!val){
            this.politikError=true;
          }else{
            this.politikError=false;
          }
       }
  },
  filters: {
    formatCurrency(value) {
      return formatNumber(value, 0, " ", " ");
    }
  }
};
</script>

