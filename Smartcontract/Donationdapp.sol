/*DONATION DAPP-CALIBRAINT TASK*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DonationPlatform {
    struct Cause {
        address payable creator;
        string title;
        string description;
        uint goal;
        uint raisedAmount;
        bool active;
        uint startDate;
        uint endDate;
        string ipfsUrl; 
    }

    mapping(uint => Cause) public causes;
    mapping(uint => mapping(address => uint)) public donations;
    uint public causeCount;

    event CauseCreated(uint causeId, address creator, string title, uint goal, uint startDate, uint endDate, string ipfsUrl);
    event DonationReceived(uint causeId, address donor, uint amount);
    event Withdrawal(uint causeId, address creator, uint amount);

    function createCause(
        string memory _title, 
        string memory _description, 
        uint _goal, 
        uint _startDate, 
        uint _endDate, 
        string memory _ipfsUrl
    ) public {
        require(_goal > 0, "Goal should be more than 0");
        require(_startDate < _endDate, "Start date should be less than end date");
        require(_endDate > block.timestamp, "End date should be in the future");

        causeCount++;
        causes[causeCount] = Cause(
            payable(msg.sender), 
            _title, 
            _description, 
            _goal, 
            0, 
            true, 
            _startDate, 
            _endDate, 
            _ipfsUrl
        );
        
        emit CauseCreated(causeCount, msg.sender, _title, _goal, _startDate, _endDate, _ipfsUrl);
    }

    function donateToCause(uint _causeId) public payable {
        require(causes[_causeId].active, "Cause is not active");
        require(msg.value > 0, "Donation should be more than 0");
        require(block.timestamp >= causes[_causeId].startDate, "Donation not started yet");
        require(block.timestamp <= causes[_causeId].endDate, "Donation period has ended");

        Cause storage cause = causes[_causeId];
        cause.raisedAmount += msg.value;
        donations[_causeId][msg.sender] += msg.value;
        
        emit DonationReceived(_causeId, msg.sender, msg.value);
    }

    function withdrawFunds(uint _causeId) public {
        Cause storage cause = causes[_causeId];
        require(msg.sender == cause.creator, "Only the creator can withdraw");
        require(cause.raisedAmount > 0, "No funds to withdraw");
        require(block.timestamp > cause.endDate, "Can't withdraw before end date");

        uint amount = cause.raisedAmount;
        cause.raisedAmount = 0;
        cause.active = false; 
        cause.creator.transfer(amount);
        
        emit Withdrawal(_causeId, cause.creator, amount);
    }

  
}
