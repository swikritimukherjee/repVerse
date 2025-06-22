// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RepToken
 * @notice This contract implements a reputation token system with logarithmic bonding curve pricing
 * @dev All token amounts in function parameters must include 18 decimal precision
 * For example, to represent 5 REP tokens, use 5 * 10^18
 * The PRICE_PRECISION constant (1e18) is used for price calculations
 */
contract RepToken is ERC20, Ownable, ReentrancyGuard {
    address public jobMarketplace;

    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public reservoir;

    // Staking pools for job marketplace
    mapping(uint256 => uint256) public jobPostersStakingPool;
    mapping(uint256 => mapping(address => uint256))
        public jobApplicantsStakingPool;

    bool public paused = false;

    event TokensBought(address indexed buyer, uint256 amount, uint256 ethCost);
    event TokensSold(
        address indexed seller,
        uint256 amount,
        uint256 ethReceived
    );
    event EmergencyPause(bool paused);
    event StakeAdded(
        uint256 indexed jobId,
        address indexed staker,
        uint256 amount,
        bool isJobPoster
    );
    event StakeReleased(
        uint256 indexed jobId,
        address indexed recipient,
        uint256 amount
    );
    event JobMarketplaceUpdated(address newJobMarketplace);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier onlyJobMarketplace() {
        require(msg.sender == jobMarketplace, "Only JobMarketplace can call");
        _;
    }

    constructor() ERC20("Reputation Token", "REP") Ownable(msg.sender) {}

    function createJobStakeAndBurn(
        address jobPoster,
        uint256 jobId,
        uint256 repAmount
    ) external onlyJobMarketplace {
        require(balanceOf(jobPoster) >= repAmount, "Insufficient balance");

        _burn(jobPoster, repAmount);

        uint256 ethAmount = calculateEthForTokens(repAmount);
        require(reservoir >= ethAmount, "Insufficient reservoir");

        reservoir -= ethAmount;
        jobPostersStakingPool[jobId] = ethAmount;
        emit StakeAdded(jobId, jobPoster, ethAmount, true);
    }

    function applyJobStakeAndBurn(
        address applicant,
        uint256 jobId,
        uint256 repAmount
    ) external onlyJobMarketplace {
        require(balanceOf(applicant) >= repAmount, "Insufficient balance");
        require(
            jobApplicantsStakingPool[jobId][applicant] == 0,
            "Applicant already has stake"
        );

        // Burn the REP tokens from applicant
        _burn(applicant, repAmount);

        // Calculate equivalent ETH amount
        uint256 ethAmount = calculateEthForTokens(repAmount);
        require(reservoir >= ethAmount, "Insufficient reservoir");

        // Remove ETH from reservoir and add to applicant staking pool
        reservoir -= ethAmount;
        jobApplicantsStakingPool[jobId][applicant] = ethAmount;

        emit StakeAdded(jobId, applicant, ethAmount, false);
    }

    function setJobMarketplace(address _jobMarketplace) external onlyOwner {
        require(_jobMarketplace != address(0), "Invalid address");
        jobMarketplace = _jobMarketplace;
        emit JobMarketplaceUpdated(_jobMarketplace);
    }

    /**
     * @notice Gets the current price of REP tokens based on logarithmic bonding curve
     * @dev Price increases logarithmically with total supply but saturates at 4 REP tokens
     * @return price The current price in wei per REP token (18 decimal precision)
     */
    function getLatestPrice() public view returns (uint256 price) {
        uint256 supply = totalSupply();
        
        // Handle case where supply is 0 or very small
        if (supply < 1e18) {
            return 1e15; // Base price of 0.001 ETH per REP token
        }
        
        // Convert supply to token count (whole tokens)
        uint256 tokenCount = supply / 1e18;
        
        // Cap token count at 4 for price calculation
        if (tokenCount > 4) {
            tokenCount = 4;
        }
        
        // Logarithmic bonding curve: price = basePrice * ln(tokenCount + 1) + minPrice
        uint256 basePriceMultiplier = 5e14; // 0.0005 ETH base multiplier
        uint256 minPrice = 1e15; // 0.001 ETH minimum price
        
        // Calculate ln(tokenCount + 1)
        uint256 lnValue = _ln(tokenCount + 1);
        
        // Calculate final price
        price = minPrice + (basePriceMultiplier * lnValue) / 1e18;
        
        return price;
    }

    /**
     * @notice Approximates natural logarithm using Taylor series
     * @dev Uses ln(1 + x) = x - x^2/2 + x^3/3 - x^4/4 + ... for x < 1
     * For larger values, uses ln(n) = ln(2^k * m) = k*ln(2) + ln(m) where m is in [1,2)
     * @param x Input value (scaled by 1e18)
     * @return Natural logarithm of x (scaled by 1e18)
     */
    function _ln(uint256 x) internal pure returns (uint256) {
        require(x > 0, "ln(0) is undefined");
        if (x == 1) return 0;
        // For x >= 2, use bit shifting to reduce to range [1, 2)
        uint256 result = 0;
        
        // Scale input for precision
        uint256 scaledX = x * 1e18;
        
        // Find the highest bit to determine how many times we can divide by 2
        uint256 temp = scaledX;
        uint256 msb = 0;
        
        while (temp >= 2 * 1e18) {
            temp /= 2;
            msb++;
        }
        
        // Add k * ln(2) where k is the number of divisions by 2
        // ln(2) ≈ 0.693147180559945309 * 1e18
        result += msb * 693147180559945309;
        
        // Now temp is in range [1e18, 2e18), calculate ln(temp/1e18) using Taylor series
        uint256 y = temp - 1e18; // y is in range [0, 1e18)
        
        if (y > 0) {
            // ln(1 + y) = y - y^2/2 + y^3/3 - y^4/4 + y^5/5
            uint256 y2 = (y * y) / 1e18;
            uint256 y3 = (y2 * y) / 1e18;
            uint256 y4 = (y3 * y) / 1e18;
            uint256 y5 = (y4 * y) / 1e18;
            
            result += y;
            result -= y2 / 2;
            result += y3 / 3;
            result -= y4 / 4;
            result += y5 / 5;
        }
        
        return result;
    }

    function calculateEthForTokens(
        uint256 repAmount
    ) public view returns (uint256 ethAmount) {
        uint256 ethPrice = getLatestPrice();
        // repAmount is expected to already include precision (e.g., 5 tokens = 5 * 10^18)
        ethAmount = (repAmount * PRICE_PRECISION) / ethPrice;
        return ethAmount;
    }

    function buy() external payable nonReentrant whenNotPaused {
        uint256 ethPrice = getLatestPrice();
        // Calculate REP amount from ETH value
        uint256 repAmount = (msg.value * ethPrice) / PRICE_PRECISION;
        require(repAmount > 0, "Buy amount too small");

        reservoir += msg.value;
        _mint(msg.sender, repAmount);
        emit TokensBought(msg.sender, repAmount, msg.value);
    }

    function sell(uint256 repAmount) external nonReentrant whenNotPaused {
        require(repAmount > 0, "Must sell positive amount");
        require(balanceOf(msg.sender) >= repAmount, "Insufficient balance");

        uint256 ethAmount = calculateEthForTokens(repAmount);
        require(reservoir >= ethAmount, "Insufficient reservoir balance");

        _burn(msg.sender, repAmount);
        reservoir -= ethAmount;

        (bool success, ) = msg.sender.call{value: ethAmount}("");
        require(success, "ETH transfer failed");
        emit TokensSold(msg.sender, repAmount, ethAmount);
    }

    function addJobPosterStake(
        uint256 jobId,
        uint256 repAmount
    ) external onlyJobMarketplace {
        require(jobPostersStakingPool[jobId] == 0, "Job already has stake");

        uint256 ethAmount = calculateEthForTokens(repAmount);
        require(reservoir >= ethAmount, "Insufficient reservoir");

        reservoir -= ethAmount;
        jobPostersStakingPool[jobId] = ethAmount;
        emit StakeAdded(jobId, tx.origin, ethAmount, true);
    }

    function addJobApplicantStake(
        uint256 jobId,
        address applicant,
        uint256 repAmount
    ) external onlyJobMarketplace {
        require(
            jobApplicantsStakingPool[jobId][applicant] == 0,
            "Applicant already has stake"
        );

        uint256 ethAmount = calculateEthForTokens(repAmount);
        require(reservoir >= ethAmount, "Insufficient reservoir");

        reservoir -= ethAmount;
        jobApplicantsStakingPool[jobId][applicant] = ethAmount;
        emit StakeAdded(jobId, applicant, ethAmount, false);
    }

    function handleSuccessfulJob(
        uint256 jobId,
        address applicant
    ) external onlyJobMarketplace {
        uint256 posterStake = jobPostersStakingPool[jobId];
        uint256 applicantStake = jobApplicantsStakingPool[jobId][applicant];
        require(posterStake > 0 && applicantStake > 0, "No stakes found");

        uint256 totalEthStake = posterStake + applicantStake;
        uint256 ethPrice = getLatestPrice();
        // Convert ETH stake to REP tokens with proper precision
        uint256 repReward = (totalEthStake * ethPrice) / PRICE_PRECISION;

        // Clear stakes
        delete jobPostersStakingPool[jobId];
        delete jobApplicantsStakingPool[jobId][applicant];

        // Add ETH back to reservoir and mint tokens to successful applicant
        reservoir += totalEthStake;
        _mint(applicant, repReward);

        emit StakeReleased(jobId, applicant, repReward);
    }

    function handleUnsuccessfulJob(
        uint256 jobId,
        address jobPoster
    ) external onlyJobMarketplace {
        uint256 posterStake = jobPostersStakingPool[jobId];
        require(posterStake > 0, "No job poster stake found");

        // Get all applicant stakes for this job
        uint256 totalApplicantStakes = 0;
        address[] memory applicants = new address[](10); // Assuming max 10 applicants for gas efficiency
        uint256 applicantCount = 0;

        // This is a simplified way to handle applicants - in production you'd want a more robust solution
        for (uint i = 0; i < 10; i++) {
            if (jobApplicantsStakingPool[jobId][applicants[i]] > 0) {
                totalApplicantStakes += jobApplicantsStakingPool[jobId][
                    applicants[i]
                ];
                applicants[applicantCount] = applicants[i];
                applicantCount++;
            }
        }

        uint256 totalEthStake = posterStake + totalApplicantStakes;
        uint256 ethPrice = getLatestPrice();
        // Convert ETH stake to REP tokens with proper precision
        uint256 repReward = (totalEthStake * ethPrice) / PRICE_PRECISION;

        // Clear all stakes
        delete jobPostersStakingPool[jobId];
        for (uint i = 0; i < applicantCount; i++) {
            delete jobApplicantsStakingPool[jobId][applicants[i]];
        }

        // Add ETH back to reservoir and mint tokens to job poster
        reservoir += totalEthStake;
        _mint(jobPoster, repReward);

        emit StakeReleased(jobId, jobPoster, repReward);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit EmergencyPause(_paused);
    }

    receive() external payable {
        reservoir += msg.value;
    }
}