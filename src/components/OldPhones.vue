<template>
  <div>
    <h1 v-if="data.length > 0">New phones stock:</h1>
    <div v-else>
      <h1 >No phones in the stock</h1>
    </div>

    <b-card-group columns
                  class="mb-3">
      <b-card
        v-for="lot in data" :key="lot.id"
        :title="lot.name"
        :img-src="lot.image"
        img-alt="image"
        img-top
        style="max-width: 20rem;"
        class="mb-2">
        <b-card-body>
          <p>Serial: {{lot.serial}}</p>
          <h3>Price: {{lot.price}} eth</h3>
          <h3>Owner: {{lot.owner}}</h3>
        </b-card-body>
        <b-button v-if="!isLotOwner(lot)"
          variant="primary" v-on:click="buy(lot)">Buy it!</b-button>

        <b-button v-if="isLotOwner(lot)"
          variant="danger" v-on:click="remove(lot)">Remove lot</b-button>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
  import PhonesMarket from '@/js/market'
  import {mapState} from 'vuex'

  export default {
    name: 'oldPhones',
    data () {
      return {
        data: []
      }
    },
    computed: mapState({
      contract: state => state.contract,
      user: state => state.user
    }),
    beforeMount: function () {
      PhonesMarket.instance.balanceOf(PhonesMarket.instance.address)
        .then(bb => console.log('contract %s balance %s', PhonesMarket.instance.address, Number(bb)))

      PhonesMarket.instance.getphoneStock(PhonesMarket.instance.address)
        .then(data => {
          let owners = data[0]
          let ids = data[1]
          let prices = data[2]

          for (let i = 0; i < ids.length; i++) {
            Promise.all([
              PhonesMarket.instance.phones(ids[i]),
              PhonesMarket.instance.tokenURI(ids[i])
            ])
              .then(it => {
                let phone = it[0]
                let url = it[1]
                this.data.push({
                  id: Number(ids[i]),
                  owner: owners[i],
                  price: window.web3.fromWei(prices[i], 'ether'),
                  name: phone[0],
                  serial: phone[1],
                  startTime: phone[2],
                  image: url
                })
              })
          }
        })
    },
    methods: {
      buy: function (lot) {
        PhonesMarket.instance.buyNew(lot.id, {
          value: window.web3.toWei(lot.price, 'ether')
        })
      },
      remove: function (lot) {
        PhonesMarket.instance.removeLot(lot.id)
          .then(receipt => {
            console.log('Lot removed', receipt)
          })
      },
      isLotOwner (lot) {
        return this.user.address === lot.owner
      }
    }
  }

</script>
