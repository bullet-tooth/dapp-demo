pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract PhonesMarket is Ownable, ERC721Token {

  // ------ DATA STRUCTURES ------
  struct Phone {
    string name;
    bytes32 serial;
    uint startTime;
  }

  struct Lot {
    address owner;
    uint price;
  }

  Phone[] public phones;
  mapping(uint => Lot) public phoneIdToLot;

  // ------ EVENTS ------
  event PhoneCreated(uint _phoneId, address _creator);
  event LotCreated(address owner, uint phoneId, uint price);
  event LotRemoved(uint phoneId, address _creator);


  constructor (string _name, string _symbol) public ERC721Token(_name, _symbol) {}

  // ------ PHONE FACTORY ------
  function producePhone(string _name, uint _price, string url) public onlyOwner {
    Phone memory phone = Phone({
      name : _name,
      serial : bytes32(keccak256(msg.sender, blockhash(block.number))),
      startTime : 0
      });

    uint phoneId = phones.push(phone) - 1;
    _mint(msg.sender, phoneId);

    emit PhoneCreated(phoneId, msg.sender);

    _setTokenURI(phoneId, url);

    phoneIdToLot[phoneId] = Lot({
      owner : msg.sender,
      price : _price
      });
    emit LotCreated(msg.sender, phoneId, _price);
  }

  //------  PHONE MARKET ------
  function getPhoneMarket(address marketOwner) public view returns (address[] _owner, uint[] _phoneId, uint[] _price) {
    uint count = balanceOf(marketOwner);

    _owner = new address[](count);
    _phoneId = new uint[](count);
    _price = new uint[](count);
    uint id;
    for (uint i = 0; i < count; i++) {
      id = tokenOfOwnerByIndex(marketOwner, i);
      _phoneId[i] = id;
      _owner[i] = phoneIdToLot[_phoneId[i]].owner;
      _price[i] = phoneIdToLot[_phoneId[i]].price;
    }
    return (_owner, _phoneId, _price);
  }

  function createLot(uint _phoneId, uint _price) public {
    transferFrom(msg.sender, this, _phoneId);

    phoneIdToLot[_phoneId] = Lot({
      owner : msg.sender,
      price : _price
      });

    emit LotCreated(msg.sender, _phoneId, _price);
  }

  function removeLot(uint _phoneId) public {
    require(ownerOf(_phoneId) == address(this));
    require(phoneIdToLot[_phoneId].owner == msg.sender);

    removeTokenFrom(this, _phoneId);
    addTokenTo(msg.sender, _phoneId);

    delete phoneIdToLot[_phoneId];
    emit LotRemoved(_phoneId, msg.sender);
  }

  // ------ PHONE BUYING ------
  function buyNew(uint _phoneId) public payable {
    require(ownerOf(_phoneId) == owner);
    _processBuying(owner, _phoneId);
    phones[_phoneId].startTime = block.number;
  }

  function buyUsed(uint _phoneId) public payable {
    require(ownerOf(_phoneId) == address(this));
    _processBuying(address(this), _phoneId);
  }

  function _processBuying(address _holder, uint _phoneId) private {
    Lot memory _lot = phoneIdToLot[_phoneId];
    // Checking if lot exists
    require(_lot.owner != address(0));
    // Checking if price is higher than bid
    require(msg.value >= _lot.price);

    _lot.owner.transfer(_lot.price);

    removeTokenFrom(_holder, _phoneId);
    addTokenTo(msg.sender, _phoneId);

    delete phoneIdToLot[_phoneId];
    emit Transfer(_lot.owner, msg.sender, _phoneId);
  }

}
