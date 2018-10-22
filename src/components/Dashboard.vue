<template>
  <div class="dashboard">
    <h1>{{ msg }}</h1>
    <h1 v-if="userPhones.length > 0">Your phones:</h1>
    <div v-else>
      <h1 >You have no phones</h1>
    </div>
    <b-card-group deck
                  class="mb-3">
      <b-card
        v-for="phone in userPhones" :key="phone.id"
        :title="phone.name"
        :img-src="phone.image"
        img-alt="image"
        img-top
        style="max-width: 20rem;"
        class="mb-2">
        <b-card-body>
          <p>Serial: {{phone.serial}}</p>
          <p>Start Time: {{phone.startTime}}</p>
        </b-card-body>
        <b-button variant="primary" v-on:click="sell(phone.id)" v-b-modal.sellphoneModal>Sell</b-button>
      </b-card>
    </b-card-group>

    <b-modal id="sellphoneModal" title="Selling phone" @ok="handleSell">
      <b-form-group horizontal
                    label="Price ETH:"
                    label-class="text-sm-right"
                    label-for="phonePrice">
        <b-form-input id="phonePrice"
                      type="number"
                      v-model="sellingPhone.price">
        </b-form-input>
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import PhonesMarket from '@/js/market'

  export default {
    name: 'dashboard',
    data () {
      return {
        msg: 'Welcome to the dapp demo',
        userPhones: [],
        sellingPhone: {
          id: null,
          price: null
        }
      }
    },
    computed: mapState({
      contract: state => state.contract,
      user: state => state.user
    }),

    beforeMount: function () {
      PhonesMarket.instance.balanceOf(this.user.address)
        .then(count => {
          for (let i = 0; i < count; i++) {
            PhonesMarket.instance.tokenOfOwnerByIndex(this.user.address, i)
              .then(phoneId => {
                Promise.all([
                  PhonesMarket.instance.phones(phoneId),
                  PhonesMarket.instance.tokenURI(phoneId)
                ])
                  .then(it => {
                    let phone = it[0]
                    let url = it[1]
                    this.userPhones.push({
                      id: Number(phoneId),
                      name: phone[0],
                      serial: phone[1],
                      startTime: phone[2],
                      image: url
                    })
                  })
              })
          }
        })
    },
    methods: {
      sell: function (id) {
        this.sellingPhone.id = id
        console.log('Got selling id', this.sellingPhone.id)
      },
      handleSell: function (event) {
        if (this.sellingPhone.price == null || this.sellingPhone.price <= 0) {
          alert('Please enter a valid price')
        }
        console.log('User is selling ', this.sellingPhone)
        PhonesMarket.instance.createLot(this.sellingPhone.id, window.web3.toWei(this.sellingPhone.price, 'ether'))
          .then(receipt => {
            console.log('Lot created', receipt)
          })

        this.sellingPhone.id = null
        this.sellingPhone.price = null
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
    display: block;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
