// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import {RepToken} from "../src/RepToken.sol";

contract DeployRepToken is Script {
    function run() external {
        vm.startBroadcast();

        RepToken repToken = new RepToken();

        console.log("RepToken deployed at:", address(repToken));
        console.log("Deployer REP balance:", repToken.balanceOf(msg.sender));

        vm.stopBroadcast();
    }
}
