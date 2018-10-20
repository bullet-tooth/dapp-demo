const Phones = artifacts.require("./PhonesMarket.sol");

contract("PhonesMarket", accounts => {
    const owner = accounts[0];
    let instance;

    before(async function () {
        instance = await Phones.deployed();
    });

    describe("Contract methods test", function () {
        it("Owner", async function () {
            assert.equal(await instance.owner(), owner);
        });

        it("Total Supply", async function () {
            assert.equal(await instance.totalSupply(), 0);
        });

        it("Get New Phones", async function () {
            let result = await instance.getPhoneMarket(owner);
            assert.isArray(result);
        });

    });

});

