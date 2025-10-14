// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BaseToken is ERC20, Ownable, ERC20Burnable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant MINT_AMOUNT = 100 * 10**18; // 100 tokens per mint
    uint256 public constant MINT_PRICE = 0.001 ether;
    
    mapping(address => bool) public hasMinted;
    
    constructor() ERC20("RundinoRun Token", "DINO") Ownable(msg.sender) {
        _mint(msg.sender, 10000 * 10**18); // Initial supply for owner
    }
    
    function mintRandom() public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(!hasMinted[msg.sender], "Already minted");
        require(totalSupply() + MINT_AMOUNT <= MAX_SUPPLY, "Max supply reached");
        
        hasMinted[msg.sender] = true;
        _mint(msg.sender, MINT_AMOUNT);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply reached");
        _mint(to, amount);
    }
    
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
