import contract from 'truffle-contract'
import PhonesMarketContract from '@contracts/PhonesMarket.json'

const PhonesMarket = {

  contract: null,
  instance: null,
  init: function () {
    let self = this

    return new Promise(function (resolve, reject) {
      self.contract = contract(PhonesMarketContract)
      self.contract.setProvider(window.web3.currentProvider)

      self.contract.deployed().then(instance => {
        self.instance = instance
        window.web3.eth.defaultAccount = window.web3.eth.accounts[0]
        resolve(instance)
      }).catch(err => {
        reject(err)
      })
    })
  }
}

export default PhonesMarket
