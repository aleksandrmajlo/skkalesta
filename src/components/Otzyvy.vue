<template>
    <div class="s-rew">

      <transition-group name='post' tag="div">
        <div class="s-rew__item s-rew__item--page container-full"
             v-cloak 
             v-for="(post,index) in posts" 
             v-if="index<limit"
             :key="index">
            <div class="container">
                <div class="row">
                    <div class="col-md-auto">
                        <div class="row align-items-center">
                            <div class="col-md col-auto">
                                <div class="s-rew__img-wrap s-rew__img-wrap--page">
                                    <img class="res-i" :src="post.img" :alt="post.title"/>
                                </div>
                            </div>
                            <div class="col d-md-none">
                                <div class="s-rew__title h5 strong">{{post.title}} </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="s-rew__title h5 strong d-none d-md-block">{{post.title}} </div>
                        <div v-html="post.content"></div>
                    </div>
                </div>
            </div>
        </div>
        </transition-group>

        <div class="text-center"  v-if="posts.length>limit" v-cloak>
                <a @click.prevent="all" class="s-rew__btn btn btn btn-block btn-warning" href="#">Посмотреть все отзывы</a>
        </div>
    </div>
</template>
<script>
let fullAddress =
  location.protocol +
  "//" +
  location.hostname +
  (location.port ? ":" + location.port : "");
if (location.port) {
  var rest_url =
    "http://kalesta.local/wp-json/otzyvs/v2/my_meta_query?meta_query[type]=page";
} else {
  var rest_url =
    fullAddress + "/wp-json/otzyvs/v2/my_meta_query?meta_query[type]=page";
}

export default {
  data() {
      return {
         posts: [],
         limit:10,
         counter:10
      }
  },
  mounted() {
    this.$http
      .get(rest_url)
      .then(response => {
          this.posts=response.data.posts
          this.limit=parseInt(response.data.limit) ;
          this.counter=parseInt(response.data.limit) ;
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods :{
      all(){
          this.limit+=this.counter;
      }
  }
};
</script>
<style lang="scss">
[v-cloak] {
  display: none;
}
</style>
<style lang="scss" scoped>
 .post-enter-active,
 .post-leave-active {
  transition: all 1s;
 }
.post-enter, .post-leave-to{
  opacity: 0; 
  transform: translateY(30px);
}
</style>

