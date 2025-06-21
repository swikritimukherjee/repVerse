// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/JobMarketplace.sol";
import "../src/RepToken.sol";

contract DeployJobMarketplace is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("\n=================================================================");
        console.log("                       DEPLOYMENT STARTED                          ");
        console.log("=================================================================\n");

        // Deploy RepToken
        console.log("Deploying RepToken...");
        RepToken repToken = new RepToken();
        console.log("RepToken deployed successfully!");
        console.log("Contract Name:    RepToken (REP)");
        console.log("Contract Address: %s", address(repToken));
        // console.log("Transaction Hash: %s", vm.getRecordedLogs()[0].topics[0]);
        console.log("-----------------------------------------------------------------\n");

        // Deploy JobMarketplace
        console.log("Deploying JobMarketplace...");
        JobMarketplace jobMarket = new JobMarketplace(payable(address(repToken)));
        console.log("JobMarketplace deployed successfully!");
        console.log("Contract Name:    JobMarketplace (JobNFT)");
        console.log("Contract Address: %s", address(jobMarket));
        // console.log("Transaction Hash: %s", vm.getRecordedLogs()[1].topics[0]);
        console.log("-----------------------------------------------------------------\n");

        // Set JobMarketplace address in RepToken
        console.log("Setting JobMarketplace address in RepToken...");
        repToken.setJobMarketplace(address(jobMarket));
        console.log("JobMarketplace address set successfully in RepToken!");
        console.log("-----------------------------------------------------------------\n");

        console.log("Contract Relationships:");
        console.log("- JobMarketplace at %s uses RepToken at %s", address(jobMarket), address(repToken));
        
        console.log("\n=================================================================");
        console.log("                     DEPLOYMENT COMPLETED                          ");
        console.log("=================================================================\n");

        // Output addresses in a format that's easy to parse
        console.log("DEPLOYED_ADDRESSES|%s|%s", address(repToken), address(jobMarket));

        vm.stopBroadcast();
    }
}