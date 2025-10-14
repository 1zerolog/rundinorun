// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BaseNFT.sol";
import "./BaseToken.sol";

contract ContractFactory is Ownable {
    struct DeployedContract {
        address contractAddress;
        string contractType;
        address deployer;
        uint256 timestamp;
    }
    
    mapping(address => DeployedContract[]) public userContracts;
    DeployedContract[] public allContracts;
    
    event ContractDeployed(
        address indexed contractAddress,
        string contractType,
        address indexed deployer,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {}
    
    function deployNFT() public returns (address) {
        BaseNFT newNFT = new BaseNFT();
        newNFT.transferOwnership(msg.sender);
        
        DeployedContract memory newContract = DeployedContract({
            contractAddress: address(newNFT),
            contractType: "NFT",
            deployer: msg.sender,
            timestamp: block.timestamp
        });
        
        userContracts[msg.sender].push(newContract);
        allContracts.push(newContract);
        
        emit ContractDeployed(
            address(newNFT),
            "NFT",
            msg.sender,
            block.timestamp
        );
        
        return address(newNFT);
    }
    
    function deployToken() public returns (address) {
        BaseToken newToken = new BaseToken();
        newToken.transferOwnership(msg.sender);
        
        DeployedContract memory newContract = DeployedContract({
            contractAddress: address(newToken),
            contractType: "Token",
            deployer: msg.sender,
            timestamp: block.timestamp
        });
        
        userContracts[msg.sender].push(newContract);
        allContracts.push(newContract);
        
        emit ContractDeployed(
            address(newToken),
            "Token",
            msg.sender,
            block.timestamp
        );
        
        return address(newToken);
    }
    
    function getUserContracts(address user) public view returns (DeployedContract[] memory) {
        return userContracts[user];
    }
    
    function getAllContracts() public view returns (DeployedContract[] memory) {
        return allContracts;
    }
    
    function getContractCount() public view returns (uint256) {
        return allContracts.length;
    }
}
