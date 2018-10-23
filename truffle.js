var HDWalletProvider = require("truffle-hdwallet-provider");
require('dotenv').config()

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(process.env.MNEMONIC, 'https://ropsten.infura.io/v3/' + process.env.MY_INFURA_ID)
      },
      network_id: 3,
      gas: 4700000
    }
  }
};
