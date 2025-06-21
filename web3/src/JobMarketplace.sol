// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./RepToken.sol";

/**
 * @title JobMarketplace
 * @notice This contract implements a job marketplace with REP token staking
 * @dev All REP token amounts in function parameters must include 18 decimal precision
 * For example, to create a job with 5 REP tokens fee, use 5 * 10^18 as the fee parameter
 */
contract JobMarketplace is ERC721, Ownable, ReentrancyGuard, Pausable {
    // --- Constants ---
    uint8 constant STATUS_ACTIVE = 0;
    uint8 constant STATUS_IN_PROGRESS = 1;
    uint8 constant STATUS_COMPLETED = 2;
    uint8 constant STATUS_CANCELLED = 3;
    uint256 internal constant STAKE_PCT = 10;
    uint256 internal constant PRICE_PRECISION = 10 ** 18;

    // --- Structures ---
    struct Job {
        address employer;
        uint256 fee;
        uint256 totalStaked;
        uint8 status;
        uint32 createdAt;
    }

    struct Application {
        uint256 stake;
        bool selected;
        bool refunded;
    }

    // --- State ---
    RepToken public repToken;
    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => string) private _jobMetadataURIs;
    mapping(uint256 => address[]) public jobApplications;
    mapping(uint256 => address[]) public selectedFreelancers;
    mapping(uint256 => mapping(address => Application)) public applications;
    mapping(address => uint256[]) public userApplications;

    // --- Events ---
    event JobCreated(
        uint256 indexed jobId,
        address indexed employer,
        uint256 fee,
        string jobMetadataURI,
        string sameAsTokenURI
    );
    event JobApplied(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 stake
    );
    event FreelancerSelected(uint256 indexed jobId, address indexed freelancer);
    event JobCompleted(uint256 indexed jobId);
    event JobCancelled(uint256 indexed jobId);
    event StakeRefunded(
        uint256 indexed jobId,
        address indexed user,
        uint256 amount
    );
    event JobNFTTransferred(
        uint256 indexed jobId,
        address indexed from,
        address indexed to
    );

    constructor(
        address payable _repToken
    ) ERC721("JobNFT", "JOB") Ownable(msg.sender) {
        require(_repToken != address(0), "Zero address");
        repToken = RepToken(_repToken);
        jobCounter = 0;
    }

    // --- Main Functions ---
    /**
     * @notice Creates a new job with the specified fee in REP tokens
     * @dev The fee parameter must include 18 decimal precision (e.g., 5 REP = 5 * 10^18)
     * @param fee The job fee in REP tokens (must include decimal precision)
     * @param jobMetadata The metadata URI for the job
     * @return jobId The ID of the created job
     */
    function createJob(
        uint256 fee,
        string calldata jobMetadata
    ) external nonReentrant whenNotPaused returns (uint256 jobId) {
        require(fee >= 0, "Fee must be greater than 0");
        require(bytes(jobMetadata).length > 0, "Metadata required");

        jobCounter++;
        jobId = jobCounter;

        repToken.createJobStakeAndBurn(msg.sender, jobId, fee);

        _safeMint(msg.sender, jobId);
        _setTokenURI(jobId, jobMetadata);

        jobs[jobId] = Job({
            employer: msg.sender,
            fee: fee,
            totalStaked: fee,
            status: STATUS_ACTIVE,
            createdAt: uint32(block.timestamp)
        });

        emit JobCreated(jobId, msg.sender, fee, jobMetadata, jobMetadata);
    }

    function applyToJob(uint256 jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[jobId];
        require(job.status == STATUS_ACTIVE, "Job not active");

        uint256 stakeAmount = (job.fee * STAKE_PCT) / 100;

        repToken.applyJobStakeAndBurn(msg.sender, jobId, stakeAmount);

        applications[jobId][msg.sender] = Application({
            stake: stakeAmount,
            selected: false,
            refunded: false
        });

        jobApplications[jobId].push(msg.sender);
        userApplications[msg.sender].push(jobId);
        job.totalStaked += stakeAmount;

        emit JobApplied(jobId, msg.sender, stakeAmount);
    }

    function selectFreelancer(
        uint256 jobId,
        address freelancer
    ) external onlyJobOwner(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == STATUS_ACTIVE, "Job not active");
        require(!applications[jobId][freelancer].selected, "Already selected");

        applications[jobId][freelancer].selected = true;
        selectedFreelancers[jobId].push(freelancer);
        job.status = STATUS_IN_PROGRESS;

        emit FreelancerSelected(jobId, freelancer);
    }

    function completeJob(
        uint256 jobId
    ) external onlyJobOwner(jobId) nonReentrant {
        require(_jobExists(jobId), "Job doesn't exist");
        Job storage job = jobs[jobId];
        require(job.status == STATUS_IN_PROGRESS, "Job not in progress");
        require(
            selectedFreelancers[jobId].length > 0,
            "No freelancers selected"
        );

        job.status = STATUS_COMPLETED;

        // Handle successful job completion in RepToken contract
        address selectedFreelancer = selectedFreelancers[jobId][0]; // Assuming single freelancer for simplicity
        repToken.handleSuccessfulJob(jobId, selectedFreelancer);

        // Transfer the job NFT from employer to freelancer
        _transferJobNFT(jobId, selectedFreelancer);

        emit JobCompleted(jobId);
    }

    /**
     * @notice Transfers the job NFT from the employer to the freelancer upon completion
     * @param jobId The ID of the completed job
     * @param freelancer The address of the freelancer to receive the NFT
     */
    function _transferJobNFT(uint256 jobId, address freelancer) internal {
        address currentOwner = ownerOf(jobId);
        
        // Transfer the NFT from current owner (employer) to freelancer
        _safeTransfer(currentOwner, freelancer, jobId, "");
        
        emit JobNFTTransferred(jobId, currentOwner, freelancer);
    }

    
    function employerCancel(
        uint256 jobId
    ) external onlyJobOwner(jobId) nonReentrant {
        require(_jobExists(jobId), "Job doesn't exist");
        Job storage job = jobs[jobId];
        require(job.status == STATUS_ACTIVE, "Invalid status");

        job.status = STATUS_CANCELLED;

        // Handle unsuccessful job in RepToken contract (original function)
        repToken.handleUnsuccessfulJob(jobId, job.employer);

        emit JobCancelled(jobId);
    }

    /**
     * @notice Employer cancels job with penalty - all stakes go to selected freelancer
     * @param jobId The ID of the job to cancel
     */
    function employerCancelWithPenalty(
        uint256 jobId
    ) external onlyJobOwner(jobId) nonReentrant {
        require(_jobExists(jobId), "Job doesn't exist");
        Job storage job = jobs[jobId];
        require(job.status == STATUS_IN_PROGRESS, "Job must be in progress");
        require(
            selectedFreelancers[jobId].length > 0,
            "No freelancers selected"
        );

        job.status = STATUS_CANCELLED;

        // Use handleSuccessfulJob - gives all stakes to the selected freelancer
        address selectedFreelancer = selectedFreelancers[jobId][0]; // Assuming single freelancer
        repToken.handleSuccessfulJob(jobId, selectedFreelancer);

        // Also transfer the NFT to the freelancer as compensation
        _transferJobNFT(jobId, selectedFreelancer);

        emit JobCancelled(jobId);
    }

    /**
     * @notice Freelancer cancels job - all stakes go to employer
     * @param jobId The ID of the job to cancel
     */
    function freelancerCancel(
        uint256 jobId
    ) external nonReentrant whenNotPaused {
        require(_jobExists(jobId), "Job doesn't exist");
        Job storage job = jobs[jobId];
        require(job.status == STATUS_IN_PROGRESS, "Job must be in progress");
        require(
            applications[jobId][msg.sender].selected,
            "Not selected for this job"
        );

        job.status = STATUS_CANCELLED;

        // Use handleUnsuccessfulJob - gives all stakes to the employer
        repToken.handleUnsuccessfulJob(jobId, job.employer);

        emit JobCancelled(jobId);
    }

    // --- Token URI Management ---
    function _setTokenURI(uint256 jobId, string memory jobMetadata) internal {
        require(_jobExists(jobId), "Job doesn't exist");
        _jobMetadataURIs[jobId] = jobMetadata;
    }

    function tokenURI(
        uint256 jobId
    ) public view override returns (string memory) {
        require(_jobExists(jobId), "Job doesn't exist");
        return _jobMetadataURIs[jobId];
    }

    // --- Job Metadata Getters ---
    function getJobMetadataURI(
        uint256 jobId
    ) external view returns (string memory) {
        require(_jobExists(jobId), "Job doesn't exist");
        return _jobMetadataURIs[jobId];
    }

    // --- Job Existence Check ---
    function _jobExists(uint256 jobId) internal view returns (bool) {
        return ownerOf(jobId) != address(0);
    }

    // --- Getters ---
    function getJobApplications(
        uint256 jobId
    ) external view returns (address[] memory) {
        require(_jobExists(jobId), "Job doesn't exist");
        return jobApplications[jobId];
    }

    function getUserApplications(
        address user
    ) external view returns (uint256[] memory) {
        return userApplications[user];
    }

    function getSelectedFreelancers(
        uint256 jobId
    ) external view returns (address[] memory) {
        require(_jobExists(jobId), "Job doesn't exist");
        return selectedFreelancers[jobId];
    }

    function getJobDetails(
        uint256 jobId
    )
        external
        view
        returns (
            address employer,
            uint256 fee,
            uint256 totalStaked,
            uint8 status,
            uint32 createdAt
        )
    {
        require(_jobExists(jobId), "Job doesn't exist");
        Job memory job = jobs[jobId];
        return (
            job.employer,
            job.fee,
            job.totalStaked,
            job.status,
            job.createdAt
        );
    }

    // --- Admin ---
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Modifiers ---
    modifier onlyJobOwner(uint256 jobId) {
        require(ownerOf(jobId) == msg.sender, "Not job owner");
        _;
    }
}