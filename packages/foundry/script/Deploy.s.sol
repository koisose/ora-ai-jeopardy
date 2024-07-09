//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";
import {IAIOracle} from "OAO/contracts/interfaces/IAIOracle.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);
 address OAO_PROXY;

    function setUp() public {
        OAO_PROXY = ["0x0A0f4321214BB6C7811dD8a71cF587bdaF03f0A0"];
    }
    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);

        YourContract yourContract = new YourContract(
            IAIOracle(OAO_PROXY)
        );
        console.logString(
            string.concat(
                "YourContract deployed at: ",
                vm.toString(address(yourContract))
            )
        );

        vm.stopBroadcast();

        

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function test() public {}
}