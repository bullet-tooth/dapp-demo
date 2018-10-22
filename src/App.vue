<template>
  <div id="app">
    <img src="https://thumbs.dreamstime.com/t/mobile-phone-online-store-concept-vector-illustration-42554345.jpg"
         class="mb-5">
    <div v-if="loadComplete">
      <b-container>
        <b-breadcrumb>
          <b-breadcrumb-item to="/">Home</b-breadcrumb-item>
          <b-breadcrumb-item to="new">New phones Market</b-breadcrumb-item>
          <b-breadcrumb-item to="old">Old phones Market</b-breadcrumb-item>
          <b-breadcrumb-item to="admin" v-if="isOwner">Admin Panel</b-breadcrumb-item>
        </b-breadcrumb>
        <router-view></router-view>
      </b-container>
    </div>
    <div v-else>
      <h1>Loading....</h1>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'app',
    computed: mapGetters({
      isOwner: 'isOwner',
      loadComplete: 'contractLoaded'
    }),
    created: function () {
      this.$store.dispatch('loadContract')
      this.$store.dispatch('loadUser')
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
