// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PhishGuardRegistry {
    address public owner;
    
    struct ScamReport {
        address reportedAddress;
        string category; // "phishing", "drainer", "fake-token"
        uint256 reportCount;
        bool isVerified;
        uint256 timestamp;
    }
    
    mapping(address => ScamReport) public scamRegistry;
    mapping(address => bool) public hasReported;
    address[] public reportedAddresses;
    
    event ScamReported(address indexed scamAddress, string category, uint256 timestamp);
    event ScamVerified(address indexed scamAddress);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function reportScam(address _scamAddress, string memory _category) external {
        require(_scamAddress != address(0), "Invalid address");
        require(!hasReported[msg.sender], "You already reported");
        
        if (scamRegistry[_scamAddress].reportedAddress == address(0)) {
            scamRegistry[_scamAddress] = ScamReport({
                reportedAddress: _scamAddress,
                category: _category,
                reportCount: 1,
                isVerified: false,
                timestamp: block.timestamp
            });
            reportedAddresses.push(_scamAddress);
        } else {
            scamRegistry[_scamAddress].reportCount++;
        }
        
        hasReported[msg.sender] = true;
        emit ScamReported(_scamAddress, _category, block.timestamp);
    }
    
    function verifyScam(address _scamAddress) external onlyOwner {
        require(scamRegistry[_scamAddress].reportedAddress != address(0), "Not reported");
        scamRegistry[_scamAddress].isVerified = true;
        emit ScamVerified(_scamAddress);
    }
    
    function isScam(address _address) external view returns (bool, string memory, uint256) {
        ScamReport memory report = scamRegistry[_address];
        return (report.isVerified, report.category, report.reportCount);
    }
    
    function getRegistrySize() external view returns (uint256) {
        return reportedAddresses.length;
    }
}
