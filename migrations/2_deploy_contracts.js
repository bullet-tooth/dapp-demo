var Phones = artifacts.require("./PhonesMarket.sol");

module.exports = function(deployer) {
  let name = 'Phones Market Demo'
  let symbol = 'PMD'
  deployer.deploy(Phones, name, symbol);
};
