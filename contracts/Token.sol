// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

contract Token {

    uint256 private totalSupply;
    string private name;
    string private symbol;
    uint8 private decimals = 18;
    address private contractOwner;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    mapping(address => bool) private whiteLists;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approve(address indexed owner, address indexed spender, uint256 amount);

    modifier whiteListCheck() {
        require(whiteLists[msg.sender], "You aren't in whiteList");
        _;
    }

    modifier onlyOwner() {
        require(contractOwner != msg.sender, "You aren't owner");
        _;
    }

    constructor(){
        contractOwner = msg.sender;
        name = "Dram";
        symbol = "AMD";
        totalSupply = 1000000;
        balances[msg.sender] = totalSupply;
    }

    function getTotalSupply () public view returns(uint256){
        return totalSupply;
    }

    function getName () public view returns(string memory){
        return name;
    }

    function getSymbol () public view returns(string memory){
        return symbol;
    }

    function getDecimals () public view returns(uint8){
        return decimals;
    }

    function balanceOf (address owner) public view returns(uint256){
        return balances[owner];
    }

    function allowance (address _owner, address _spender)public view returns(uint256){
        return allowances[_owner][_spender];
    }

    function getWhiteList (address owner) public view returns(bool){
        return whiteLists[owner];
    }

    function approve (address spender, uint256 amount) public returns(bool){
        require(balances[msg.sender] >= amount,"not enough funds");
        allowances[msg.sender][spender] += amount;
        emit Approve(msg.sender, spender, amount);
        return true;
    }

    function transfer (address to, uint256 amount) public whiteListCheck returns(bool){
        require(balances[msg.sender] >= amount, "Not enough funds");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom (address from, address to, uint256 amount) public whiteListCheck returns(bool){
        require(allowances[from][to] >= amount, "Not enough allowance");
        transfer(to, amount);
        allowances[from][to] -= amount;
        return true;
    }


    function mint (address to, uint256 amount) public onlyOwner{
        totalSupply += amount;
        balances[to] += amount;
    }

    function burn (address from, uint256 amount) public onlyOwner {
        require(balances[from] >= amount, "Not enough funds");
        balances[from] -= amount;
        totalSupply -= amount;
    }

    function _mint (address to, uint256 amount) internal {
        totalSupply += amount;
        balances[to] += amount;
    }

    function _burn (address from, uint256 amount) internal {
        require(balances[from] >= amount, "Not enough funds");
        balances[from] -= amount;
        totalSupply -= amount;
    }

    function buy () public payable {
        _mint(msg.sender, msg.value);
    }

    function sell (uint256 amount) public {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    function editWhiteList (address spender) public returns(bool){
        whiteLists[spender] = !whiteLists[spender];
        return true;
    }
}