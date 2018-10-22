import Vue from 'vue'
import Vuex from 'vuex'
import PhonesMarket from '@/js/market'

Vue.use(Vuex)

// initial state
const state = {
  admin: {
    totalSupply: -1
  },
  contract: {
    owner: ''
  },
  user: {
    address: ''
  }
}

// getters
const getters = {
  isOwner: state => {
    return state.contract.owner === state.user.address
  },
  contractLoaded: state => {
    return state.contract.owner !== ''
  }
}

// actions
const actions = {
  loadContract (context) {
    PhonesMarket.init()
      .then(() => {
        PhonesMarket.instance.owner()
          .then(owner => {
            console.log('Got owner address', owner)
            context.commit({
              type: 'setContractOwner',
              address: owner
            })
          })
      })
  },
  loadUser (context) {
    window.web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        context.commit({
          type: 'setUserAddress',
          address: account
        })
      }
    })
  },
  loadAdminInfo (context) {
    Promise.all([
      PhonesMarket.instance.totalSupply()
    ])
      .then(data => {
        context.commit({
          type: 'setTotalSupply',
          value: data[0]
        })
      })
  }
}

// mutations
const mutations = {
  setContractOwner (state, payload) {
    state.contract.owner = payload.address
  },
  setUserAddress (state, payload) {
    state.user.address = payload.address
  },
  setTotalSupply (state, payload) {
    state.admin.totalSupply = payload.value
  }
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})
