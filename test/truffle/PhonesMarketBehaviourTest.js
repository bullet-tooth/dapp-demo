const Phones = artifacts.require("./PhonesMarket.sol");

contract("PhonesContract", accounts => {
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    let instance;

    const testPhone = {
        price: 100,
        name: "test phone 1"
    };
    const testPhone2 = {
        price: 200,
        name: "test phone 2"
    };

    before(async function () {
        instance = await Phones.deployed();
    });

    describe("Produce new phones tests", async function () {

        it("Produce first phone", async function () {
            let receipt, phoneId, phone;

            // First phone
            receipt = await instance.producePhone(testPhone.name, testPhone.price, 'test url');
            assert.equal(receipt.logs[0].event, "Transfer");
            assert.equal(receipt.logs[1].event, "PhoneCreated");

            phoneId = await instance.tokenOfOwnerByIndex(owner, 0);
            assert.equal(await instance.totalSupply(), 1);
            assert.equal(await instance.balanceOf(owner), 1);

            phone = await instance.phones(phoneId);
            assert.equal(phone[0], testPhone.name);
            assert.isNotNull(phone[1]); // serial
            assert.equal(phone[2], 0); // start time
        });

        it("Produce second phone", async function () {
            let receipt, phoneId, phone;
            receipt = await instance.producePhone(testPhone2.name, testPhone2.price, 'test url');
            assert.equal(receipt.logs[0].event, "Transfer");
            assert.equal(receipt.logs[1].event, "PhoneCreated");

            assert.equal(await instance.totalSupply(), 2);
            assert.equal(await instance.balanceOf(owner), 2);
            phoneId = await instance.tokenOfOwnerByIndex(owner, 1);

            phone = await instance.phones(phoneId);
            assert.equal(phone[0], testPhone2.name);
            assert.isNotNull(phone[1]); // serial
            assert.equal(phone[2], 0); // start time
        });

        it("Check new phones stock", async function () {
            assert.equal(await instance.totalSupply(), 2);
            let count = await instance.balanceOf(owner);
            assert.equal(count, 2);
            let stock = await instance.getPhoneMarket(owner);

            assert.isArray(stock);
            assert.lengthOf(stock[0], count);
            assert.lengthOf(stock[1], count);
            // assert price
            assert.equal(stock[2][0], testPhone.price);
            assert.equal(stock[2][1], testPhone2.price);

            // assert phone details
            let phone = await instance.phones(stock[1][0]);
            assert.equal(phone[0], testPhone.name);

            phone = await instance.phones(stock[1][1]);
            assert.equal(phone[0], testPhone2.name);
        });

      it("Produce phones is allowed for owner only", async function () {
        await assertRevert(instance.producePhone('phone3', 100, 'test url', {from: user1}));
        await assertRevert(instance.producePhone('phone3', 100, 'test url', {from: user2}));
      });

    });

    describe("Buy new phones test", function () {
        it("User buys first phone", async function () {
            let phoneId = 0;

            let ownerBalance = balanceEth(owner);
            let receipt = await instance.buyNew(phoneId, {from: user1, value: testPhone.price});
            assert.equal(receipt.logs[0].event, "Transfer");

            // assert user received phone
            assert.equal(await instance.balanceOf(user1), 1);
            // assert start time
            phone = await instance.phones(phoneId);
            assert.equal(phone[2], receipt.receipt.blockNumber);

            // assert balanceEth
            assert.equal(balanceEth(owner), ownerBalance + ether(testPhone.price));
        });
    });

    describe("Lots test", function () {
        it("User creates lot", async function () {
            let phoneId = 0;
            let price = 300;

            let receipt = await instance.createLot(phoneId, price, {from: user1});
            assert.equal(receipt.logs[0].event, "Transfer");
            assert.equal(receipt.logs[1].event, "LotCreated");

            // assert lot
            let lot = await instance.phoneIdToLot(phoneId);
            assert.equal(lot[0], user1);
            assert.equal(lot[1], price);
            // assert user phones
            assert.equal(await instance.balanceOf(user1), 0);
        });

        it("User removes lot", async function () {
            let phoneId = 0;

            let receipt = await instance.removeLot(phoneId, {from: user1});
            assert.equal(receipt.logs[0].event, "LotRemoved");

            // assert lot
            assert.equal((await instance.phoneIdToLot(phoneId))[0], "0x0000000000000000000000000000000000000000");
            // assert user phones
            assert.equal(await instance.balanceOf(user1), 1);
        });
    });

    describe("Used phones test", function () {
        it("User sells phone", async function () {
            let phoneId = 0;
            let price = 300;

            await instance.createLot(phoneId, price, {from: user1});
            // assert user phones
            assert.equal(await instance.balanceOf(user1), 0);

            let user1Balance = balanceEth(user1);
            let user2Balance = balanceEth(user2);
            let receipt = await instance.buyUsed(phoneId, {from: user2, value: price});
            assert.equal(receipt.logs[0].event, "Transfer");

            // assert user phones
            assert.equal(await instance.balanceOf(user1), 0);
            assert.equal(await instance.balanceOf(user2), 1);

            // assert balanceEth
            const delta = 0.00000001;
            let transactionPrice = receipt.receipt.gasUsed * ether(web3.eth.getTransaction(receipt.tx).gasPrice);
            assert.isBelow(balanceEth(user1) - user1Balance - ether(price), delta);
            assert.isBelow(user2Balance - balanceEth(user2) - ether(price) - transactionPrice, delta);

        });
    });

});

function balanceEth(account) {
    return ether(web3.eth.getBalance(account));
}

function ether(wei) {
    return Number(web3.fromWei(wei, "ether"));
}

async function assertRevert (promise) {
  try {
    await promise;
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
    return;
  }
  assert.fail('Expected revert not received');
}
