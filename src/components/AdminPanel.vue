<template>
  <div>
    <div>
      <h1>Statistics: </h1>
      <h4>Produced phones count: {{Number(adminInfo.totalSupply)}}</h4>
    </div>

    <div class="mt-5">
      <h1>Administrative operations: </h1>

      <b-card bg-variant="light" class="mt-3">
        <b-form-group horizontal
                      breakpoint="lg"
                      label="Produce new phone:"
                      label-size="lg"
                      label-class="font-weight-bold pt-0"
                      class="mb-0">
          <b-form-group horizontal
                        label="Phone name:"
                        label-class="text-sm-right"
                        label-for="phoneName">
            <b-form-input id="phoneName"
                          v-model="newPhone.name"></b-form-input>
          </b-form-group>
          <b-form-group horizontal
                        label="Price ETH:"
                        label-class="text-sm-right"
                        label-for="phonePrice">
            <b-form-input id="phonePrice"
                          type="number"
                          v-model="newPhone.price">
            </b-form-input>
          </b-form-group>
          <b-form-group horizontal
                        label="Image url:"
                        label-class="text-sm-right"
                        label-for="phoneUrl">
            <b-form-input id="phoneUrl"
                          v-model="newPhone.url">
            </b-form-input>
          </b-form-group>
        </b-form-group>
        <b-button variant="primary" v-on:click="createPhone">Create</b-button>
      </b-card>

    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  import PhonesMarket from '@/js/market'

  export default {
    name: 'adminPanel',
    data () {
      return {
        newPhone: {
          name: '',
          price: null,
          url: ''
        }
      }
    },
    computed: mapState({
      adminInfo: state => state.admin
    }),

    beforeMount: function () {
      this.$store.dispatch('loadAdminInfo')
    },
    methods: {
      createPhone: function () {
        PhonesMarket.instance.producePhone(
          this.newPhone.name,
          window.web3.toWei(this.newPhone.price, 'ether'),
          this.newPhone.url)
          .then(receipt => {
            console.log(receipt)
          })
      }
    }
  }
</script>
