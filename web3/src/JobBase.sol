// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import {RepToken} from "./RepToken.sol";

abstract contract JobBase is Ownable, ReentrancyGuard, Pausable {
    constructor(address _repToken, address initialOwner) 
        Ownable(initialOwner) 
    {
        require(_repToken != address(0), "Zero address");
        repToken = IERC20(_repToken);
        authorizedOracles[msg.sender] = true;
    }

    struct Job {
        address employer;
        uint256 totalFee;
        uint256 maxFreelancers;
        uint8 status;
        uint32 createdAt;
        uint16 selectedCount;
        bool multiFreelancerAllowed;
    }

    struct Application {
        uint256 stake;
        uint32 appliedAt;
        bool selected;
        bool refunded;
    }

    // --- Constants ---
    uint8 constant STATUS_ACTIVE = 0;
    uint8 constant STATUS_IN_PROGRESS = 1;
    uint8 constant STATUS_COMPLETED = 2;
    uint8 constant STATUS_CANCELLED = 3;
    uint256 internal constant FREELANCER_STAKE_PCT = 10;
    uint256 internal constant EMPLOYER_STAKE_PCT = 10;
    uint256 internal constant MAX_FREELANCERS_PER_JOB = 50;

    // --- State ---
    IERC20 public repToken;
    uint256 internal _jobCounter;
    mapping(address => bool) public authorizedOracles;
    mapping(uint256 => Job) internal _jobs;
    mapping(uint256 => mapping(address => Application)) internal _applications;
    mapping(uint256 => mapping(address => string)) internal _proposalURIs;
    mapping(uint256 => address[]) internal _applicants;
    mapping(uint256 => address[]) internal _selectedFreelancers;
    mapping(uint256 => uint256) internal _escrowBalances;
    mapping(uint256 => uint256) internal _employerStakes;
    mapping(address => uint256[]) internal _userApplications;
    mapping(address => uint256[]) internal _employerJobs;
    mapping(uint256 => string) internal _jobNames;
    mapping(uint256 => string) internal _jobImageURIs;
    mapping(uint256 => string) internal _jobDescriptionURIs;

    // --- Modifiers ---
    modifier validJob(uint256 jobId) {
        require(jobId != 0 && jobId <= _jobCounter, "Invalid job");
        _;
    }

    modifier onlyEmployer(uint256 jobId) {
        require(_jobs[jobId].employer == msg.sender, "Not employer");
        _;
    }

    modifier onlyEmployerOrOracle(uint256 jobId) {
        require(
            _jobs[jobId].employer == msg.sender || authorizedOracles[msg.sender],
            "Not authorized"
        );
        _;
    }

    modifier inStatus(uint256 jobId, uint8 status) {
        require(_jobs[jobId].status == status, "Invalid job status");
        _;
    }

    // --- Internal Utilities ---
    function _calcStake(uint256 amount, uint256 pct) internal pure returns (uint256) {
        return (amount * pct) / 100;
    }

    function _safeTransfer(IERC20 token, address to, uint256 amount) internal returns (bool) {
        return token.transfer(to, amount);
    }

    function _safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal returns (bool) {
        return token.transferFrom(from, to, amount);
    }

    // --- Admin ---
    function setOracle(address oracle, bool authorized) external onlyOwner {
        authorizedOracles[oracle] = authorized;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(repToken), "Cannot withdraw escrow token");
        _safeTransfer(IERC20(token), owner(), amount);
    }
}
